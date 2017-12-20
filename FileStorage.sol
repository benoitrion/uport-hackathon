pragma solidity ^0.4.15;

contract FileStorage {
    string storedData;

    function set(string x) public {
        storedData = x;
    }

    function get() public constant returns (string x) {
        return storedData;
    }
}
