#[test_only]
module blockchain_sui::transport_scenarios {

    use sui::test_scenario as ts;
    use blockchain_sui::transport;

    #[test]
    fun create_all_modes() {
        let mut scenario = ts::begin(@0xA11CE);

        let (carrier, route, product) = (
            b"IMO1234567",
            b"route-hash",
            b"product-id"
        );

        let ctx = ts::ctx(&mut scenario);
        transport::create_leg(0, carrier, route, product, ctx);

        ts::next_tx(&mut scenario, @0xA11CE);

        let ctx = ts::ctx(&mut scenario);
        transport::create_leg(1, carrier, route, product, ctx);

        ts::next_tx(&mut scenario, @0xA11CE);

        let ctx = ts::ctx(&mut scenario);
        transport::create_leg(2, carrier, route, product, ctx);

        ts::end(scenario);
    }
}