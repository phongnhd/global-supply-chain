module blockchain_sui::access_control {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct ArtisanCap has key, store {
        id: UID,
    }

    public struct LogisticsCap has key, store {
        id: UID,
    }

    public fun issue_artisan_cap(ctx: &mut TxContext) {
        let cap = ArtisanCap {
            id: object::new(ctx),
        };

        transfer::public_transfer(cap, tx_context::sender(ctx));
    }

    public fun issue_logistics_cap(ctx: &mut TxContext) {
        let cap = LogisticsCap {
            id: object::new(ctx),
        };

        transfer::public_transfer(cap, tx_context::sender(ctx));
    }
}