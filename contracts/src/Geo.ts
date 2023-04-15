import {
  Field,
  SmartContract,
  PublicKey,
  state,
  State,
  method,
} from 'snarkyjs';

/**
 * Geo
 * Validate that a prover's private coordinates are within a target area.
 */
export class Geo extends SmartContract {
  @state(Field) minLat = State<Field>();
  @state(Field) minLng = State<Field>();
  @state(Field) maxLat = State<Field>();
  @state(Field) maxLng = State<Field>();

  events = {
    attended: PublicKey,
  };

  init() {
    super.init();
    // initial values - Tokyo
    this.minLat.set(Field(3558));
    this.minLng.set(Field(13956));
    this.maxLat.set(Field(3574));
    this.maxLng.set(Field(13987));
  }

  // note: lat and long should be ints (2 decimal point precision * 100)
  @method validateCoords(user: PublicKey, lat: Field, lng: Field) {
    this.minLat.assertEquals(this.minLat.get());
    this.minLng.assertEquals(this.minLng.get());
    this.maxLng.assertEquals(this.maxLng.get());
    this.maxLat.assertEquals(this.maxLat.get());

    lat.assertGreaterThanOrEqual(this.minLat.get());
    lng.assertGreaterThanOrEqual(this.minLng.get());
    lat.assertLessThanOrEqual(this.maxLat.get());
    lng.assertLessThanOrEqual(this.maxLng.get());

    this.emitEvent('attended', user);
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
