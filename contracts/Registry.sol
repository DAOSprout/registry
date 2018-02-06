pragma solidity ^0.4.16;

/**
 * @author Eliott TEISSONNIERE
 * @title Registry
 * @description Registry ethereum entities (mostly contracts), users pay to get registered. 
 */

import "./zeppelin/Ownable.sol";


contract Registry is Ownable {
    struct Entry {
        address owner;

        bytes32 name;
        bytes32 info;
    }

    mapping (address => Entry) public entries;
    uint public feeInWei;

    event AddedEntry(address indexed entryAddress, bytes32 name, bytes32 info, address indexed owner);
    event UpdatedOwnership(address indexed entryAddress, address indexed newOwner, address indexed oldOwner);
    event UpdatedName(address indexed entryAddress, bytes32 name, address indexed owner);
    event UpdatedInfo(address indexed entryAddress, bytes32 info, address indexed owner);
    event UpdatedFee(uint newFee, address indexed owner);
    event CollectedFee(address indexed owner);

    modifier onlyEntryOwner(address entryAddress) {
        require(entries[entryAddress].owner == msg.sender);
        _;
    }

    modifier mustPayFee {
        require(msg.value == feeInWei);
        _;
    }

    function Registry(uint _feeInWei) Ownable() public {
        feeInWei = _feeInWei;
    }

    function withdrawFees() onlyOwner public {
        msg.sender.transfer(this.balance);
        
        CollectedFee(msg.sender);
    }

    function updateFee(uint _newFeeInWei) onlyOwner public {
        feeInWei = _newFeeInWei;

        UpdatedFee(_newFeeInWei, msg.sender);
    }

    function getEntry(address _entry) constant public returns (address, bytes32, bytes32) {
        return (entries[_entry].owner, entries[_entry].name, entries[_entry].info);
    }

    function register(address _entry, bytes32 _name, bytes32 _info) mustPayFee public payable {
        // Entry must not exist
        require(entries[_entry].owner == 0x0);

        entries[_entry] = Entry({
            owner: msg.sender,
            name: _name,
            info: _info
        });

        AddedEntry(
            _entry,
            _name,
            _info,
            msg.sender
        );
    }

    function setName(address _entry, bytes32 _newName) onlyEntryOwner(_entry)  public {
        entries[_entry].name = _newName;

        UpdatedName(_entry, _newName, msg.sender);
    }

    function setInfo(address _entry, bytes32 _info) onlyEntryOwner(_entry)  public {
        entries[_entry].info = _info;

        UpdatedInfo(_entry, _info, msg.sender);
    }

    function transferEntryOwnership(address _entry, address _newOwner) onlyEntryOwner(_entry)  public {
        entries[_entry].owner = _newOwner;

        UpdatedOwnership(_entry, _newOwner, msg.sender);
    }
}
