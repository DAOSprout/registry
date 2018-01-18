Upon creation:
  - auto register itself, owner will be deployer.
  - deployer configures a fee in wei to get registered (can be 0).
  - deployer is set as contract owner.

Anyone can:
  - register a contract via `register(address, name, more_info)`.
  - access an entry by its address and see its name and link via `getEntry(address)`.

Upon registration:
  - we check the fee.
  - entry is added to the registry with its address, name and info link.
  - the registror is configured as the owner of the entry.

An owner (of an entry) can:
  - call `setName(address, new_name)`.
  - call `setInfo(address, new_info)`.
  - transfer its ownership via `transferEntryOwnership(address, new_owner)`.

The contract owner can:
  - transfer its ownership thanks to the standard function `transferOwnership`.
  - update the registration fee.
  - withdraw fees collected.

Events:
  - `AddedEntry(address, name, info, owner_address)`.
  - `UpdatedOwnership(address, new_owner, old_owner)`.
  - `UpdatedName(address, name, owner)`.
  - `UpdatedInfo(address, info, owner)`.
  - `UpdatedFee(new_fee, registry_owner)`.
  - `CollectedFee(registry_owner)`.
