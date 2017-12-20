pragma solidity ^0.4.15;

contract AccessControl {

    struct Accessor {
        address addr;
        string name;
        uint index;
    }

    address[] userIndex;
    address public requester;
    mapping (address => mapping (address => Accessor)) public accessors;

    function AccessControl() public {
        requester = msg.sender;
    }

    function getProfessionalListSize() public view returns (uint size) {
        return userIndex.length;
    }

    function addAccess(address _a, string _name) public returns (bool added) {
        accessors[requester][_a] = Accessor({addr: _a, name: _name, index: userIndex.length});
        userIndex[userIndex.length] = _a;
        userIndex.length++;
        return true;
    }

    function revokeAccess(address _a) public returns (bool revoked) {
        uint rowToDelete = accessors[requester][_a].index;
        address keyToMove = userIndex[userIndex.length-1];
        userIndex[rowToDelete] = keyToMove;
        accessors[requester][_a].index = rowToDelete;
        userIndex.length--;
        return true;
    }

    function getProfessionalAtIndex(uint _index) public view returns (address addr, string name) {
        if (_index >= userIndex.length) return;
        address keyToGet = userIndex[_index];
        return (accessors[requester][keyToGet].addr, accessors[requester][keyToGet].name);
    }
}
