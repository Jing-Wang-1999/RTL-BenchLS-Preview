# VeeR EH1 Errata

## Back-to-back Write Transactions Not Supported on AHB-Lite Bus

### Description

The AHB-Lite bus interface for LSU is not optimized for write performance.
Each aligned store is issued to the bus as a single write transaction followed by an idle cycle.
Each unaligned store is issued to the bus as multiple backto-back byte write transactions followed by an idle cycle.
These idle cycles limit the achievable bus utilization for writes.

### Symptoms

Potential performance impact for writes with AHB-Lite bus.

### Workaround

None.

## Debug Write to minstret Register Stores Incremented Value

### Description

A debugger may attempt to initialize the `minstret` register to a specific value by using the access register abstract command.
The abstract command's write operation itself is incorrectly counted as a retired instruction and causes the actually value written to the `minstret` register to be one higher than the intended value.

### Symptoms

When initializing the `minstret` register to a specific value from a debugger using the access register abstract command, then reading back this register indicates that the actual written value is one higher than the intended value.

### Workaround

When issuing an access register abstract command from a debugger to write the `minstret` register, the written value should be one less than the intended value to compensate for the incorrect increment.
To initialize the 64-bit `minstret` counter to '0', the value 0xFFFF\_FFFF must be written to the `minstreth` register first, followed by writing 0xFFFF\_FFFF to the `minstret` register.

## Debug Abstract Command Register May Return Non-Zero Value on Read

### Description

The RISC-V External Debug specification specifies the abstract command (`command`) register as write-only (see Section 4.14.7 in [[3]](intro.md#ref-3)).
However, the VeeR EH1 implementation supports write as well as read operations to this register.
This may help a debugger's feature discovery process, but is not fully compliant with the RISC-V External Debug specification.
Because the expected return value for reading this register is always zero, it is unlikely that a debugger expecting a zero value would attempt to read it.

### Symptoms

Reading the debug abstract command (`command`) register may return a non-zero value.

### Workaround

A debugger should avoid reading the abstract command register if it cannot handle non-zero data.
