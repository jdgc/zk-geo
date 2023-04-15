import { Field, SmartContract, state, State, method } from 'snarkyjs';

/**
 * Geo
 * Validate that a prover's private coordinates are within a target area.
 */
export class Geo extends SmartContract {
  @state(Field) minLat = State<Field>();
  @state(Field) minLng = State<Field>();
  @state(Field) maxLat = State<Field>();
  @state(Field) maxLng = State<Field>();

  init() {
    super.init();
    // initial values - Tokyo
    this.minLat.set(Field(35.58));
    this.minLng.set(Field(139.56));
    this.maxLat.set(Field(35.74));
    this.maxLng.set(Field(139.87));
  }

  @method updateTarget(
    minLat: Field,
    minLng: Field,
    maxLat: Field,
    maxLng: Field
  ) {
    this.minLat.set(minLat);
    this.minLng.set(minLng);
    this.maxLat.set(maxLat);
    this.maxLng.set(maxLng);
  }
}
