#![no_main]
#![no_std]

use alloy_core::{
    sol,
    sol_types::{SolCall, SolEvent},
};
use pallet_revive_uapi::{HostFn, HostFnImpl as api, ReturnFlags, StorageFlags};

extern crate alloc;
use alloc::vec;

// Define the Flipper contract interface
sol!("Flipper.sol");

#[global_allocator]
static mut ALLOC: picoalloc::Mutex<picoalloc::Allocator<picoalloc::ArrayPointer<1024>>> = {
    static mut ARRAY: picoalloc::Array<1024> = picoalloc::Array([0u8; 1024]);

    picoalloc::Mutex::new(picoalloc::Allocator::new(unsafe {
        picoalloc::ArrayPointer::new(&raw mut ARRAY)
    }))
};

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    // Safety: The unimp instruction is guaranteed to trap
    unsafe {
        core::arch::asm!("unimp");
        core::hint::unreachable_unchecked();
    }
}

/// Storage key for the boolean value (slot 0)
const VALUE_KEY: [u8; 32] = [0u8; 32];

/// Get the current boolean value from storage
fn get_value() -> bool {
    let mut value_bytes = vec![0u8; 32];
    let mut output = value_bytes.as_mut_slice();

    match api::get_storage(StorageFlags::empty(), &VALUE_KEY, &mut output) {
        Ok(_) => {
            // Check if the last byte is non-zero (Solidity stores bool as uint8)
            output[31] != 0
        }
        Err(_) => false,
    }
}

/// Set the boolean value in storage
fn set_value(value: bool) {
    let mut value_bytes = vec![0u8; 32];
    value_bytes[31] = if value { 1 } else { 0 };

    api::set_storage(StorageFlags::empty(), &VALUE_KEY, &value_bytes);
}

/// Emit a Flipped event
fn emit_flipped(new_value: bool) {
    let _event = Flipper::Flipped { new_value };

    // The signature hash is the first topic (the event ID)
    let topics = [Flipper::Flipped::SIGNATURE_HASH.0];

    // Manually encode the data (bool as u256/32 bytes)
    let mut data = [0u8; 32];
    data[31] = if new_value { 1 } else { 0 };

    api::deposit_event(&topics, &data);
}

/// Constructor: Initialize the flipper with false
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn deploy() {
    // Initialize the value to false
    set_value(false);
}

/// Main entry point for contract calls
#[no_mangle]
#[polkavm_derive::polkavm_export]
pub extern "C" fn call() {
    // 1. input handling
    let call_data_len = api::call_data_size();
    let mut call_data = vec![0u8; call_data_len as usize];
    api::call_data_copy(&mut call_data, 0);

    // 2. selector extraction
    // We expect at least 4 bytes for the function selector
    if call_data.len() < 4 {
        api::return_value(ReturnFlags::REVERT, b"Input too short");
    }

    let selector: [u8; 4] = call_data[0..4].try_into().unwrap();

    // 3. dispatching
    match selector {
        // Handle flip() function call
        Flipper::flipCall::SELECTOR => {
            let current = get_value();
            let new_value = !current;
            set_value(new_value);
            emit_flipped(new_value);
        }

        // Handle get() function call
        Flipper::getCall::SELECTOR => {
            let current = get_value();

            // 4. return encoding
            let mut return_data = [0u8; 32];
            return_data[31] = if current { 1 } else { 0 };
            api::return_value(ReturnFlags::empty(), &return_data);
        }

        _ => {
            // Unknown function selector - revert
            api::return_value(ReturnFlags::REVERT, b"Unknown function");
        }
    }
}
