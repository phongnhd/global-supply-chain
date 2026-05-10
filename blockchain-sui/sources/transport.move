module blockchain_sui::transport {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    const RAIL: u8 = 0;
    const SEA: u8 = 1;
    const AIR: u8 = 2;

    public struct TransportLeg has key, store {
        id: UID,
        mode: u8,
        carrier_id: vector<u8>,
        route_hash: vector<u8>,
        product_id: vector<u8>,
    }

    public fun create_leg(
        mode: u8,
        carrier_id: vector<u8>,
        route_hash: vector<u8>,
        product_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(mode <= AIR, 0);

        let leg = TransportLeg {
            id: object::new(ctx),
            mode,
            carrier_id,
            route_hash,
            product_id,
        };

        transfer::public_transfer(leg, tx_context::sender(ctx));
    }
}