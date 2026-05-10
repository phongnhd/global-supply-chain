module blockchain_sui::product {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct BirthCertificate has key, store {
        id: UID,
        name: vector<u8>,
        origin_hash: vector<u8>,
    }

    public fun mint(
        name: vector<u8>,
        origin_hash: vector<u8>,
        ctx: &mut TxContext
    ) {
        let cert = BirthCertificate {
            id: object::new(ctx),
            name,
            origin_hash,
        };

        transfer::public_transfer(cert, tx_context::sender(ctx));
    }
}
#[test_only]
module blockchain_sui::product_test {

    use sui::test_scenario;
    use blockchain_sui::product;

    #[test]
    fun test_mint() {
        let mut scenario = test_scenario::begin(@0xA11CE);

        let ctx = test_scenario::ctx(&mut scenario);

        product::mint(
            b"Apple",
            b"hash123",
            ctx
        );

        test_scenario::end(scenario);
    }
}