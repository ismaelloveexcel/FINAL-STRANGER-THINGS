import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore, LEVEL_CONFIGS } from './store';

/**
 * EnemyAI Component - Dynamic Enemy AI System
 *
 * Features:
 * - Pathfinding around obstacles using A* algorithm
 * - Chase behavior to hunt the player
 * - Enemy-specific attack patterns (Demogorgon leap, Mind Flayer ranged, Vecna boss)
 * - Difficulty scaling based on level
 * - Coordinated group tactics for Mind Flayers
 * - Telegraphed attack patterns for bosses
 */

interface EnemyAIProps {
  enemyId: string;
  position: THREE.Vector3;
  type: 'demogorgon' | 'mindFlayer' | 'vecna';
  onMove: (newPosition: THREE.Vector3) => void;
  onAttack: () => void;
}

// Obstacle map for pathfinding (simplified grid-based system)
const GRID_SIZE = 1;
const MAP_SIZE = 50;
const obstacles = new Set<string>();

// Node for A* pathfinding
interface PathNode {
  x: number;
  z: number;
  g: number; // Cost from start
  h: number; // Heuristic to goal
  f: number; // Total cost
  parent?: PathNode;
}

/**
 * A* Pathfinding algorithm
 * Finds optimal path around obstacles
 */
function findPath(
  start: THREE.Vector3,
  goal: THREE.Vector3,
  maxIterations = 100
): THREE.Vector3[] | null {
  const startNode: PathNode = {
    x: Math.round(start.x / GRID_SIZE),
    z: Math.round(start.z / GRID_SIZE),
    g: 0,
    h: 0,
    f: 0
  };

  const goalNode = {
    x: Math.round(goal.x / GRID_SIZE),
    z: Math.round(goal.z / GRID_SIZE)
  };

  const openList: PathNode[] = [startNode];
  const closedSet = new Set<string>();

  const heuristic = (node: PathNode) => {
    return Math.abs(node.x - goalNode.x) + Math.abs(node.z - goalNode.z);
  };

  startNode.h = heuristic(startNode);
  startNode.f = startNode.h;

  let iterations = 0;

  while (openList.length > 0 && iterations < maxIterations) {
    iterations++;

    // Get node with lowest f score
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    const nodeKey = `${current.x},${current.z}`;

    // Check if we reached the goal
    if (current.x === goalNode.x && current.z === goalNode.z) {
      // Reconstruct path
      const path: THREE.Vector3[] = [];
      let node: PathNode | undefined = current;
      while (node) {
        path.unshift(new THREE.Vector3(node.x * GRID_SIZE, 0.5, node.z * GRID_SIZE));
        node = node.parent;
      }
      return path;
    }

    closedSet.add(nodeKey);

    // Check neighbors (4 directions)
    const neighbors = [
      { x: current.x + 1, z: current.z },
      { x: current.x - 1, z: current.z },
      { x: current.x, z: current.z + 1 },
      { x: current.x, z: current.z - 1 },
      // Diagonal movements
      { x: current.x + 1, z: current.z + 1 },
      { x: current.x + 1, z: current.z - 1 },
      { x: current.x - 1, z: current.z + 1 },
      { x: current.x - 1, z: current.z - 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.z}`;

      // Skip if already evaluated or is obstacle
      if (closedSet.has(neighborKey) || obstacles.has(neighborKey)) {
        continue;
      }

      // Skip if out of bounds
      if (Math.abs(neighbor.x) > MAP_SIZE || Math.abs(neighbor.z) > MAP_SIZE) {
        continue;
      }

      const isDiagonal = neighbor.x !== current.x && neighbor.z !== current.z;
      const moveCost = isDiagonal ? 1.414 : 1;
      const g = current.g + moveCost;

      const existingNode = openList.find(n => n.x === neighbor.x && n.z === neighbor.z);

      if (!existingNode || g < existingNode.g) {
        const newNode: PathNode = {
          x: neighbor.x,
          z: neighbor.z,
          g,
          h: heuristic(neighbor),
          f: 0,
          parent: current
        };
        newNode.f = newNode.g + newNode.h;

        if (existingNode) {
          Object.assign(existingNode, newNode);
        } else {
          openList.push(newNode);
        }
      }
    }
  }

  // No path found, return direct line
  return null;
}

/**
 * Enemy AI Hook
 * Manages AI behavior for individual enemies
 */
export function useEnemyAI(props: EnemyAIProps) {
  const { enemyId, position, type, onMove, onAttack } = props;

  const playerPosition = useGameStore(state => state.playerPosition);
  const currentLevel = useGameStore(state => state.currentLevel);
  const updateEnemyAI = useGameStore(state => state.updateEnemyAI);
  const enemy = useGameStore(state => state.enemies.find(e => e.id === enemyId));

  const pathRef = useRef<THREE.Vector3[]>([]);
  const pathIndexRef = useRef(0);
  const lastPathUpdateRef = useRef(0);
  const attackCooldownRef = useRef(0);
  const leapCooldownRef = useRef(0);
  const rangedAttackCooldownRef = useRef(0);
  const bossPhaseRef = useRef(0);
  const circleAngleRef = useRef(Math.random() * Math.PI * 2);

  const config = LEVEL_CONFIGS[currentLevel];
  const aiConfig = config.aiConfig;

  useFrame((_, delta) => {
    if (!playerPosition || !enemy) return;

    const playerVec = new THREE.Vector3(...playerPosition);
    const distanceToPlayer = position.distanceTo(playerVec);
    const now = Date.now();

    // Update attack cooldown
    attackCooldownRef.current = Math.max(0, attackCooldownRef.current - delta * 1000);
    leapCooldownRef.current = Math.max(0, leapCooldownRef.current - delta * 1000);
    rangedAttackCooldownRef.current = Math.max(0, rangedAttackCooldownRef.current - delta * 1000);

    // Determine AI state based on distance and type
    let aiState: 'idle' | 'chase' | 'attack' | 'retreat' = 'chase';

    if (distanceToPlayer <= aiConfig.attackRange) {
      aiState = 'attack';
    } else if (distanceToPlayer > aiConfig.attackRange * 2) {
      aiState = 'chase';
    }

    // Boss-specific behavior for Vecna
    if (type === 'vecna') {
      handleVecnaBoss(distanceToPlayer, playerVec, delta, now);
    } else if (type === 'mindFlayer') {
      handleMindFlayer(distanceToPlayer, playerVec, delta, now);
    } else if (type === 'demogorgon') {
      handleDemogorgon(distanceToPlayer, playerVec, delta, now);
    }

    updateEnemyAI(enemyId, aiState, [playerVec.x, playerVec.y, playerVec.z]);
  });

  /**
   * Demogorgon AI - Aggressive melee with leap attacks
   */
  function handleDemogorgon(
    distance: number,
    playerPos: THREE.Vector3,
    delta: number,
    now: number
  ) {
    // Leap attack when in range
    if (aiConfig.leapAttack && distance < 10 && distance > 3 && leapCooldownRef.current <= 0) {
      const leapDirection = new THREE.Vector3()
        .subVectors(playerPos, position)
        .normalize()
        .multiplyScalar(15); // Fast leap

      const newPos = position.clone().add(leapDirection.multiplyScalar(delta));
      onMove(newPos);
      leapCooldownRef.current = 3000; // 3 second cooldown

      if (distance < aiConfig.attackRange) {
        onAttack();
        attackCooldownRef.current = aiConfig.attackCooldown;
      }
    } else {
      // Normal chase behavior
      moveTowardsPlayer(playerPos, aiConfig.chaseSpeed, delta);
    }

    // Attack if in range
    if (distance < aiConfig.attackRange && attackCooldownRef.current <= 0) {
      onAttack();
      attackCooldownRef.current = aiConfig.attackCooldown;
    }
  }

  /**
   * Mind Flayer AI - Ranged attacks with group coordination
   */
  function handleMindFlayer(
    distance: number,
    playerPos: THREE.Vector3,
    delta: number,
    now: number
  ) {
    // Maintain distance for ranged attacks
    const optimalDistance = 8;

    if (distance < optimalDistance - 2) {
      // Too close, retreat
      const retreatDirection = new THREE.Vector3()
        .subVectors(position, playerPos)
        .normalize()
        .multiplyScalar(aiConfig.chaseSpeed * 0.8);

      const newPos = position.clone().add(retreatDirection.multiplyScalar(delta));
      onMove(newPos);
    } else if (distance > optimalDistance + 2) {
      // Too far, advance
      moveTowardsPlayer(playerPos, aiConfig.chaseSpeed, delta);
    } else {
      // At optimal range, strafe
      circleAngleRef.current += delta * 0.5;
      const strafeOffset = new THREE.Vector3(
        Math.cos(circleAngleRef.current) * 2,
        0,
        Math.sin(circleAngleRef.current) * 2
      );
      const newPos = position.clone().add(strafeOffset);
      onMove(newPos);
    }

    // Ranged attack
    if (distance <= aiConfig.attackRange && rangedAttackCooldownRef.current <= 0) {
      onAttack();
      rangedAttackCooldownRef.current = aiConfig.attackCooldown;
    }
  }

  /**
   * Vecna Boss AI - Multi-phase with telegraphed attacks
   */
  function handleVecnaBoss(
    distance: number,
    playerPos: THREE.Vector3,
    delta: number,
    now: number
  ) {
    if (!enemy) return;

    // Determine boss phase based on health
    const healthPercent = (enemy.health / enemy.maxHealth) * 100;

    if (healthPercent > 66) {
      bossPhaseRef.current = 1;
    } else if (healthPercent > 33) {
      bossPhaseRef.current = 2;
    } else {
      bossPhaseRef.current = 3;
    }

    // Phase 1: Slow approach with basic attacks
    if (bossPhaseRef.current === 1) {
      moveTowardsPlayer(playerPos, aiConfig.chaseSpeed * 0.7, delta);

      if (distance <= aiConfig.attackRange && attackCooldownRef.current <= 0) {
        onAttack();
        attackCooldownRef.current = aiConfig.attackCooldown;
      }
    }
    // Phase 2: Teleport and area attacks
    else if (bossPhaseRef.current === 2) {
      // Circle the player
      circleAngleRef.current += delta * 0.3;
      const circleRadius = 10;
      const circlePos = new THREE.Vector3(
        playerPos.x + Math.cos(circleAngleRef.current) * circleRadius,
        position.y,
        playerPos.z + Math.sin(circleAngleRef.current) * circleRadius
      );

      const moveDir = new THREE.Vector3()
        .subVectors(circlePos, position)
        .normalize()
        .multiplyScalar(aiConfig.chaseSpeed);

      onMove(position.clone().add(moveDir.multiplyScalar(delta)));

      if (attackCooldownRef.current <= 0) {
        onAttack();
        attackCooldownRef.current = aiConfig.attackCooldown * 0.7; // Faster attacks
      }
    }
    // Phase 3: Aggressive with rapid attacks
    else {
      moveTowardsPlayer(playerPos, aiConfig.chaseSpeed * 1.5, delta);

      if (attackCooldownRef.current <= 0) {
        onAttack();
        attackCooldownRef.current = aiConfig.attackCooldown * 0.5; // Much faster
      }
    }
  }

  /**
   * Move towards player with pathfinding
   */
  function moveTowardsPlayer(playerPos: THREE.Vector3, speed: number, delta: number) {
    const now = Date.now();

    // Update path every 500ms
    if (now - lastPathUpdateRef.current > 500 && aiConfig.pathfindingEnabled) {
      lastPathUpdateRef.current = now;
      const path = findPath(position, playerPos);

      if (path && path.length > 1) {
        pathRef.current = path;
        pathIndexRef.current = 0;
      } else {
        // No path found, move directly
        pathRef.current = [];
      }
    }

    // Follow path or move directly
    if (pathRef.current.length > 0 && pathIndexRef.current < pathRef.current.length) {
      const targetNode = pathRef.current[pathIndexRef.current];
      const direction = new THREE.Vector3()
        .subVectors(targetNode, position)
        .normalize()
        .multiplyScalar(speed);

      const newPos = position.clone().add(direction.multiplyScalar(delta));
      onMove(newPos);

      // Check if reached current node
      if (position.distanceTo(targetNode) < 1) {
        pathIndexRef.current++;
      }
    } else {
      // Direct movement
      const direction = new THREE.Vector3()
        .subVectors(playerPos, position)
        .normalize()
        .multiplyScalar(speed);

      const newPos = position.clone().add(direction.multiplyScalar(delta));
      onMove(newPos);
    }
  }
}

/**
 * Add obstacle to pathfinding grid
 */
export function addObstacle(position: THREE.Vector3) {
  const x = Math.round(position.x / GRID_SIZE);
  const z = Math.round(position.z / GRID_SIZE);
  obstacles.add(`${x},${z}`);
}

/**
 * Remove obstacle from pathfinding grid
 */
export function removeObstacle(position: THREE.Vector3) {
  const x = Math.round(position.x / GRID_SIZE);
  const z = Math.round(position.z / GRID_SIZE);
  obstacles.delete(`${x},${z}`);
}

/**
 * Clear all obstacles
 */
export function clearObstacles() {
  obstacles.clear();
}

export default useEnemyAI;
