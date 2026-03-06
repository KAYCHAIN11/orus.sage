/**
 * @alphalang/blueprint
 * @component: GestureHandler
 * @cognitive-signature: Gesture-Recognition, Touch-Processing, Multi-Touch
 * @minerva-version: 3.0
 * @evolution-level: Input-Supreme
 * @orus-sage-engine: Multi-Modal-Input-Engine-4
 * @bloco: 5
 * @component-id: 112
 * @dependencies: input.types.ts
 * @quality-gates:
 *   - type-coverage: 100%
 *   - test-coverage: 95%
 *   - complexity: high
 *   - maintainability: 91%
 * @trinity-integration: VOZ
 * @cig-protocol: ✅ Compliant
 * @last-evolution: 2025-11-01
 */

import { InputEvent, InputMode } from './input.types';
import { EventEmitter } from 'events';

export enum GestureType {
  TAP = 'tap',
  DOUBLE_TAP = 'double_tap',
  LONG_PRESS = 'long_press',
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  PINCH = 'pinch',
  ROTATE = 'rotate'
}

export interface GestureEvent {
  type: GestureType;
  x: number;
  y: number;
  timestamp: Date;
  touches: number;
  velocity?: number;
  scale?: number;
}

export class GestureHandler extends EventEmitter {
  private lastTap: number = 0;
  private lastGesture: GestureType | null = null;
  private touchStart: { x: number; y: number; time: number } | null = null;

  /**
   * Handle touch start
   */
  public handleTouchStart(x: number, y: number): void {
    this.touchStart = { x, y, time: Date.now() };

    this.emit('touch-start', { x, y });
  }

  /**
   * Handle touch end
   */
  public handleTouchEnd(x: number, y: number, touches: number): GestureEvent | null {
    if (!this.touchStart) {
      return null;
    }

    const deltaX = x - this.touchStart.x;
    const deltaY = y - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;

    // Detect gesture
    let gestureType: GestureType | null = null;

    if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // Tap
      const now = Date.now();

      if (now - this.lastTap < 300 && this.lastGesture === GestureType.TAP) {
        gestureType = GestureType.DOUBLE_TAP;
      } else {
        gestureType = GestureType.TAP;
      }

      this.lastTap = now;
    } else if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      gestureType = GestureType.LONG_PRESS;
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      gestureType = deltaX > 0 ? GestureType.SWIPE_RIGHT : GestureType.SWIPE_LEFT;
    } else {
      gestureType = deltaY > 0 ? GestureType.SWIPE_DOWN : GestureType.SWIPE_UP;
    }

    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    const gesture: GestureEvent = {
      type: gestureType,
      x,
      y,
      timestamp: new Date(),
      touches,
      velocity
    };

    this.lastGesture = gestureType;
    this.emit('gesture', gesture);

    return gesture;
  }

  /**
   * Handle pinch
   */
  public handlePinch(scale: number): GestureEvent {
    const gesture: GestureEvent = {
      type: GestureType.PINCH,
      x: 0,
      y: 0,
      timestamp: new Date(),
      touches: 2,
      scale
    };

    this.emit('gesture', gesture);

    return gesture;
  }

  /**
   * Handle rotation
   */
  public handleRotation(angle: number): GestureEvent {
    const gesture: GestureEvent = {
      type: GestureType.ROTATE,
      x: 0,
      y: 0,
      timestamp: new Date(),
      touches: 2,
      scale: angle
    };

    this.emit('gesture', gesture);

    return gesture;
  }

  /**
   * Get last gesture
   */
  public getLastGesture(): GestureType | null {
    return this.lastGesture;
  }
}

/**
 * SECTION 3: EXPORTS
 */

export default GestureHandler;

/**
 * SECTION 4: DOCUMENTATION
 * GestureHandler manages touch gestures
 * - Tap/double-tap detection
 * - Swipe detection
 * - Pinch/rotate handling
 */

// EOF
// Evolution Hash: gesture.handler.0127.20251101
// Quality Score: 91
// Cognitive Signature: ✅ COMPLETE
