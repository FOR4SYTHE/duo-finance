"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useCartifyStore_1 = require("../src/store/useCartifyStore");
const assert_1 = require("assert");
async function runTests() {
    console.log("Running Cartify Store Tests...");
    const store = useCartifyStore_1.useCartifyStore.getState();
    // Reset store before tests
    store.endTrip();
    // 1. Test Mode & Budget Setup
    store.startTrip(1000, 'planned');
    let state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.isActive, true, "Trip should be active");
    assert_1.default.strictEqual(state.mode, 'planned', "Mode should be planned");
    assert_1.default.strictEqual(state.budget, 1000, "Budget should be 1000");
    assert_1.default.strictEqual(state.isBuildingList, true, "Should be building list in planned mode");
    // 2. Test addPlannedItem (still-need status)
    store.addPlannedItem('Milk', 'Dairy');
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items.length, 1, "Should have 1 item");
    const milkId = state.items[0].id;
    assert_1.default.strictEqual(state.items[0].name, 'Milk', "Item name should be Milk");
    assert_1.default.strictEqual(state.items[0].status, 'still-need', "Item should be still-need");
    assert_1.default.strictEqual(state.items[0].unitPrice, 0, "Price should be 0");
    assert_1.default.strictEqual(state.items[0].quantity, 0, "Quantity should be 0");
    assert_1.default.strictEqual(state.items[0].amount, 0, "Amount should be 0");
    // 3. Test updateItemPrice (transition from still-need to in-cart)
    store.updateItemPrice(milkId, 150);
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items[0].status, 'in-cart', "Status should transition to in-cart");
    assert_1.default.strictEqual(state.items[0].unitPrice, 150, "Unit price should be 150");
    assert_1.default.strictEqual(state.items[0].quantity, 1, "Quantity should jump to 1");
    assert_1.default.strictEqual(state.items[0].amount, 150, "Amount should be 150");
    // 4. Test Stepper Math (increment)
    store.incrementQuantity(milkId);
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items[0].quantity, 2, "Quantity should be 2");
    assert_1.default.strictEqual(state.items[0].amount, 300, "Amount should be unitPrice * quantity (300)");
    // 5. Test Stepper Math (decrement)
    store.decrementQuantity(milkId);
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items[0].quantity, 1, "Quantity should be 1");
    assert_1.default.strictEqual(state.items[0].amount, 150, "Amount should be 150");
    // 6. Test 0-quantity revert logic
    store.decrementQuantity(milkId);
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items[0].quantity, 0, "Quantity should be 0");
    assert_1.default.strictEqual(state.items[0].status, 'still-need', "Should revert to still-need");
    assert_1.default.strictEqual(state.items[0].unitPrice, 0, "Unit price should clear to 0");
    assert_1.default.strictEqual(state.items[0].amount, 0, "Amount should clear to 0");
    // 7. Test removeItem
    store.removeItem(milkId);
    state = useCartifyStore_1.useCartifyStore.getState();
    assert_1.default.strictEqual(state.items.length, 0, "Item should be removed completely");
    console.log("All tests passed! 🎉");
}
runTests().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
