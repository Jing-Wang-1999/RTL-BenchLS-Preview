# Memory Map

This chapter describes the memory map as well as the various memories and their properties of the VeeR EH1 core.

## Address Regions

The 32-bit address space is subdivided into sixteen fixed-sized, contiguous 256MB regions.
Each region has a set of access control bits associated with it (see Section 3.8.1).

## Access Properties

Each region has two access properties which can be independently controlled.  They are:

- **Cacheable**: Indicates if this region is allowed to be cached or not.
- **Side effect**: Indicates if read/write accesses to this region may have side effects (i.e., non-idempotent accesses which may potentially have side effects on any read/write access; typical for I/O, speculative or redundant accesses must be avoided) or have no side effects (i.e., idempotent accesses which have no side effects even if the same access is performed multiple times; typical for memory).  Note that stores with potential side effects (i.e., to non-idempotent addresses) cannot be combined with other stores in the core's write buffer.

## Memory Types

There are two different classes of memory types mapped into the core's 32-bit address range, core local and system bus attached.

### Core Local

#### ICCM and DCCM

Two dedicated memories, one for instruction and the other for data, are tightly coupled to the core.
These memories provide low-latency access and SECDED ECC protection.
Their respective sizes (4, 8, 16, 32, 48 [^1] , 64, 128, 256, or 512KB) are set as arguments at build time of the core.

#### Local Memory-mapped Control/Status Registers

To provide control for regular operation, the core requires a number of memory-mapped control/status registers.
For example, some external interrupt functions are controlled and serviced with accesses to various registers while the system is running.

### Accessed via System Bus

#### System ROMs

The SoC may host ROMs which are mapped to the core's memory address range and accessed via the system bus.
Both instruction and data accesses are supported to system ROMs.

#### System SRAMs

The SoC hosts a variety of SRAMs which are mapped to the core's memory address range and accessed via the system bus.

#### System Memory-mapped I/O

The SoC hosts a variety of I/O device interfaces which are mapped to the core's memory address range and accessed via the system bus.

### Mapping Restrictions

Core-local memories and system bus-attached memories must be mapped to different regions.
Mapping both classes of memory types to the same region is not allowed.

Furthermore, it is recommended that all core-local memories are mapped to the same region.

## Memory Type Access Properties

Table 3-1 specifies the access properties of each memory type.
During system boot, firmware must initialize the properties of each region based on the memory type present in that region.

Note that some memory-mapped I/O and control/status registers may have no side effects (i.e., are idempotent), but characterizing all these registers as having potentially side effects (i.e., are non-idempotent) is safe.

:::{list-table} **Access Properties for each Memory Type**
:header-rows: 1

* - Memory Type
  - Cacheable
  - Side Effect
* - **Core Local**
  -
  -
* - ICCM
  - No
  - No
* - DCCM
  - No
  - No
* - Memory-mapped control/status registers
  - No
  - Yes
* - **Accessed via System Bus**
  -
  -
* - ROMs
  - Yes
  - No
* - SRAMs
  - Yes
  - No
* - I/Os
  - No
  - Yes
* - Memory-mapped control/status registers
  - No
  - Yes
:::

:::{note}
'Cacheable = Yes' and 'Side Effect = Yes' is an illegal combination.
:::

## Memory Access Ordering

Loads and stores to system bus-attached memory (i.e., accesses with no side effects, idempotent) and devices (i.e., accesses with potential side effects, non-idempotent) go through a read buffer and a write buffer, respectively.
The buffers are implemented as FIFOs.

### Load-to-Load and Store-to-Store Ordering

All loads are sent to the system bus interface in program order.
Also, all stores are sent to the system bus interface in program order.

### Load/Store Ordering

#### Accesses with Potential Side Effects (i.e., Non-Idempotent)

When a load with potential side effects (i.e., non-idempotent) enters the read buffer, the entire write buffer is emptied, i.e., both stores with no side effects (i.e., idempotent) and with potential side effects (i.e., non-idempotent) are drained out.
Loads with potential side effects (i.e., non-idempotent) are sent out to the system bus with their exact size.

Stores with potential side effects (i.e., non-idempotent) are neither coalesced nor forwarded to a load.

#### Accesses with No Side Effects (i.e., Idempotent)

Loads with no side effects (i.e., idempotent) are always issued as double-words and check the contents of the write buffer:

1. **Full address match** (all load bytes present in the write buffer): Data is forwarded from the write buffer.  The load does neither freeze the pipe nor go out to the system bus.
2. **Partial address match** (some of the load bytes are in the write buffer): The entire write buffer is emptied, then the load request goes to the system bus.
3. **No match** (none of the bytes are in the write buffer): The load is presented to the system bus interface without waiting for the stores to drain.

#### Ordering of Store - Load with No Side Effects (i.e., Idempotent)

A `fence` instruction is required to order an older store before a younger load with no side effects (i.e., idempotent).

:::{note}
All memory-mapped register writes must be followed by a `fence` instruction to enforce ordering and synchronization.
:::

### Fencing

#### Instructions

The `fencei.i` instruction operates on the instruction memory and/or I-cache.
This instruction causes a flush, a flash invalidation of the I-cache, and a refetch of the next program counter (RFNPC).
The refetch is guaranteed to miss the I-cache.
Note that since the `fencei.i` instruction is used to synchronize the instruction and data streams, it also includes the functionality of the `fence` instruction (see Sections 3.5.3.2 and 3.5.3.3).

#### Data

The `fence` instruction is implemented conservatively in VeeR EH1 to keep the implementation simple.
It always performs the most conservative fencing, independent of the instruction's arguments.
The `fence` instruction is presynced to make sure that there are no instructions in the LSU pipe.
It stalls until the LSU indicates that the read buffer has been cleared, the store and write buffers have been fully drained (i.e., are empty), and the bus barrier (see Section 3.5.3.3) is finished.
The `fence` instruction is only committed after all LSU buffers are idle and all outstanding bus transactions are completed.

#### Bus Barrier

VeeR EH1 provides a bus barrier mechanism.
Executing a `fence` instruction forces a bus synchronization action which requires all outstanding bus transactions (reads and writes) for the LSU bus master to complete.

Hardware uses an 8-bit counter with which it continuously keeps track of the number of outstanding bus transactions.
For every request sent, this counter is incremented; for every response received, this counter is decremented.
The maximum number of outstanding bus transactions is 255.
If this limit is reached, no further transactions are sent to the bus until the number of outstanding bus transactions is smaller than 255.
A bus barrier requires the count to reach 0 before the barrier is finished.

Loads are not allowed to be forwarded across an older bus barrier.
The LSU enforces this within the core pipeline.
Also, the LSU does not forward from the write buffer if the buffer itself contains a bus barrier.

The `fence` instruction leverages the semantics of the bus barrier.
A `fence` instruction waits for all prior bus transactions to finish in addition to the write buffer being fully drained before proceeding.
Instructions after a `fencei.i` are guaranteed to see previous writes in the case of self-modifying code.

### Imprecise Data Bus Errors

All store errors as well as non-blocking load errors on the system bus are imprecise.
The address of the first occurring imprecise data system bus error is logged and a non-maskable interrupt (NMI) is flagged for the first reported error only.
For stores, if there are other stores in the write buffer behind the store which had the error, these stores are sent out on the system bus and any error responses are ignored.
Similarly, for non-blocking loads, any error responses on subsequent loads sent out on the system bus are ignored.
NMIs are fatal, architectural state is lost, and the core needs to be reset.
The reset also unlocks the first error address capture register again.

:::{note}
It is possible to unlock the first error address capture register with a write to an unlock register as well (see Section 3.8.4 for more details), but this may result in unexpected behavior.
:::

## Memory Protection

To eliminate issuing speculative accesses to the IFU and LSU bus interfaces, VeeR EH1 provides a rudimentary memory protection mechanism for instruction and data accesses outside of the ICCM and DCCM memory regions.
Separate core build arguments for instructions and data are provided to enable and configure up to 8 address windows each.

An instruction fetch to a non-ICCM region must fall within the address range of at least one instruction access window for the access to be forwarded to the IFU bus interface.
If at least one instruction access window is enabled, nonspeculative fetch requests which are not within the address range of any enabled instruction access window cause a precise instruction access fault exception.
If none of the 8 instruction access windows is enabled, the memory protection mechanism for instruction accesses is turned off.
For the ICCM region, accesses within the ICCM's address range are allowed.
However, any access not within the ICCM's address range results in a precise instruction access fault exception.

Similarly, a load/store access to a non-DCCM or non-PIC memory-mapped control register region must fall within the address range of at least one data access window for the access to be forwarded to the LSU bus interface.
If at least one data access window is enabled, non-speculative load/store requests which are not within the address range of any enabled data access window cause a precise load/store address misaligned or access fault exception.
If none of the 8 data access windows is enabled, the memory protection mechanism for data accesses is turned off.
For the DCCM and PIC memory-mapped control register region(s), accesses within the DCCM's or the PIC memory-mapped control register's address range are allowed.
However, any access not within the DCCM's or PIC memory-mapped control register's address range results in a precise load/store address misaligned or access fault exception.

The configuration parameters for each of the 8 instruction and 8 data access windows are:

- Enable/disable instruction/data access window 0..7,
- a base address of the window (which must be 64B-aligned), and
- a mask specifying the size of the window (which must be an integer-multiple of 64 bytes minus 1).

See Section 17.1 for more information.

## Exception Handling

Capturing the faulting effective address causing an exception helps assist firmware in handling the exception and/or provides additional information for firmware debugging.
For precise exceptions, the faulting effective address is captured in the standard RISC-V `mtval` register (see Section 4.1.17 in [[2]](intro.md#ref-2)).  For imprecise exceptions, the address of the first occurrence of the error is captured in a platform-specific error address capture register (see Section 3.8.3).

### Imprecise Bus Error Non-Maskable Interrupt

Store bus errors are fatal and cause a non-maskable interrupt (NMI).
The store bus error NMI has an mcause value of 0xF000\_0000.

Likewise, non-blocking load bus errors are fatal and cause a non-maskable interrupt (NMI).
The non-blocking load bus error NMI has an mcause value of 0xF000\_0001.

:::{note}
The address of the first store or non-blocking load error on the D-bus is captured in the `mdseac` register (see Section 3.8.3).
The register is unlocked either by resetting the core after the NMI has been handled or by a write to the `mdeau` register (see Section 3.8.4).
While the `mdseac` register is locked, subsequent D-bus errors are gated (i.e., they do not cause another NMI), but NMI requests originating external to the core are still honored.
:::

:::{note}
If store and non-blocking load bus errors are reported in the same clock cycle (i.e., the LSU's write and read buffers simultaneous indicate a bus error), the non-blocking load bus error has higher priority.
:::

### Correctable Error Local Interrupt

I-cache parity/ECC errors, ICCM correctable ECC errors, and DCCM correctable ECC errors are counted in separate correctable error counters (see Sections 4.5.1, 4.5.2, and 4.5.3, respectively).
Each counter also has its separate programmable error threshold.
If any of these counters has reached its threshold, a correctable error local interrupt is signaled.
Firmware should determine which of the counters has reached the threshold and reset that counter.

A local-to-the-core interrupt for correctable errors has pending (`mceip`) and enable (`mceie`) bits in bit position 30 of the standard RISC-V mip (see Table 11-2) and `mie` (see Table 11-1) registers, respectively.
The priority is lower than RISC-V External interrupt, but higher than RISC-V Timer interrupt (see Table 13-1).
The correctable error local interrupt has an mcause value of 0x8000\_001E (see Table 11-3).

### Rules for Core-Local Memory Accesses

The rules for instruction fetch and load/store accesses to core-local memories are:

1. An instruction fetch access to a region
    - a. containing one or more ICCM sub-region(s) causes an exception if
      - i. the access is not completely within the ICCM sub-region, or
      - ii. the boundary of an ICCM to a non-ICCM sub-region and vice versa is crossed,

      even if the region contains a DCCM/PIC memory-mapped control register sub-region.

    - b. not containing an ICCM sub-region goes out to the system bus, even if the region contains a DCCM/PIC memory-mapped control register sub-region.
2. A load/store access to a region
    - a. containing one or more DCCM/PIC memory-mapped control register sub-region(s) causes an exception if
      - i. the access is not completely within the DCCM/PIC memory-mapped control register subregion, or
      - ii. the boundary of
          1. a DCCM to a non-DCCM sub-region and vice versa, or
          2. a PIC memory-mapped control register sub-region

        is crossed,

      even if the region contains an ICCM sub-region.

    - b. not containing a DCCM/PIC memory-mapped control register sub-region goes out to the system bus, even if the region contains an ICCM sub-region.

### Unmapped Addresses

:::{list-table} **Handling of Unmapped Addresses**
:header-rows: 1

* - Access
  - Core/Bus
  - Side Effect
  - Action
  - Comments
* - Fetch
  - Core
  - N/A
  - Instruction access fault exception [^2],[^3]
  - Precise exception (e.g., address out-of-range)
* - Fetch
  - Bus
  - N/A
  - Instruction access fault exception [^2]
  - Precise exception (e.g., address out-of-range)
* - Load
  - Core
  - No
  - Load access fault exception [^4],[^5]
  - Precise exception (e.g., address out-of-range)
* - Load
  - Bus
  - No [^6] (non-blocking load)
  - Non-blocking load bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Load
  - Bus
  - Yes [^6] (non-blocking load)
  - Non-blocking load bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Load
  - Bus
  - No [^7] (blocking load)
  - Load access fault exception
  - Precise exception (e.g., address out-of-range)
* - Load
  - Bus
  - Yes [^8] (blocking load)
  - Load access fault exception
  - * Precise exception
    * Hold off all external interrupts
* - Store
  - Core
  - No
  - Store/AMO [^9] access fault exception [^4],[^5]
  - Precise exception
* - Store
  - Bus
  - No
  - Store bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Store
  - Bus
  - Yes
  - Store bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - DMA Read
  - Bus
  - N/A
  - DMA slave bus error
  - Send error response to master
* - DMA Write
  - Bus
  - N/A
  - DMA slave bus error
  - Send error response to master
:::

:::{note}
It is recommended to provide address gaps between different memories to ensure unmapped address exceptions are flagged if memory boundaries are inadvertently crossed.
:::

### Misaligned Accesses

General notes:

- The core performs a misalignment check during the address calculation.
- Splitting a load/store from/to an address with no side effects (i.e., idempotent) is not of concern for VeeR EH1.
- Accesses across region boundaries always cause a misaligned exception.

:::{list-table} **Handling of Misaligned Accesses**
:header-rows: 1

* - Access
  - Core/Bus
  - Side Effect
  - Region Cross
  - Action
  - Comments
* - Fetch
  - Core
  - N/A
  - No
  - N/A
  - Not possible [^10]
* - Fetch
  - Bus
  - N/A
  - No
  - N/A
  - Not possible [^10]
* - Load
  - Core
  - No
  - No
  - Load split into multiple DCCM read accesses
  - Split performed by core
* - Load
  - Bus
  - No
  - No
  - Load split into multiple bus transactions
  - Split performed by core
* - Load
  - Bus
  - Yes [^11]
  - No
  - Load address misaligned exception
  - Precise exception
* - Store
  - Core
  - No
  - No
  - Store split into multiple DCCM write accesses
  - Split performed by core
* - Store
  - Bus
  - No
  - No
  - Store split into multiple bus transactions
  - Split performed by core
* - Store
  - Bus
  - Yes [^11]
  - No
  - Store/AMO address misaligned exception
  - Precise exception
* - Fetch
  - N/A
  - N/A
  - Yes
  - N/A
  - Not possible [^10]
* - Load
  - N/A
  - N/A
  - Yes
  - Load address misaligned exception
  - Precise exception
* - Store
  - N/A
  - N/A
  - Yes
  - Store/AMO address misaligned exception
  - Precise exception
* - DMA Read
  - Bus
  - N/A
  - N/A
  - DMA slave bus error
  - Send error response to master
* - DMA Write [^12]
  - Bus
  - N/A
  - N/A
  - DMA slave bus error
  - Send error response to master
:::

### Uncorrectable ECC Errors

:::{list-table} **Handling of Uncorrectable ECC Errors**
:header-rows: 1

* - Access
  - Core/Bus
  - Side Effect
  - Action
  - Comments
* - Fetch
  - Core
  - N/A
  - Instruction access fault exception
  - Precise exception (i.e., for oldest instruction in pipeline only)
* - Fetch
  - Bus
  - N/A
  - Instruction access fault exception
  - Precise exception (i.e., for oldest instruction in pipeline only)
* - Load
  - Core
  - No
  - Load access fault exception
  - Precise exception (i.e., for non-speculative load only)
* - Load
  - Core
  - Yes
  - Load access fault exception
  - Precise exception (i.e., for non-speculative load only)
* - Load
  - Bus
  - No [^13] (non-blocking load)
  - Non-blocking load bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Load
  - Bus
  - Yes [^13] (non-blocking load)
  - Non-blocking load bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Load
  - Bus
  - No [^14] (blocking load)
  - Load access fault exception
  - Precise exception
* - Load
  - Bus
  - Yes [^15] (blocking load)
  - Load access fault exception
  - Precise exception
* - Store
  - Core
  - No
  - Store/AMO access fault exception
  - Precise exception (i.e., for non-speculative store only)
* - Store
  - Core
  - Yes
  - Store/AMO access fault exception
  - Precise exception (i.e., for non-speculative store only)
* - Store
  - Bus
  - No
  - Store bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - Store
  - Bus
  - Yes
  - Store bus error NMI (see Section 3.7.1)
  - * Imprecise, fatal
    * Capture store address in core bus interface
* - DMA Read
  - Bus
  - N/A
  - DMA slave bus error
  - Send error response to master
:::

:::{note}
DMA write accesses to the ICCM or DCCM always overwrite entire 32-bit words and their corresponding ECC bits.
Therefore, ECC bits are never checked and errors not detected on DMA writes.
:::

### Correctable ECC/Parity Errors

:::{list-table} **Handling of Correctable ECC/Parity Errors**
:header-rows: 1

* - Access
  - Core/Bus
  - Side Effect
  - Action
  - Comments
* - Fetch
  - Core
  - N/A
  - For I-cache accesses:

    * Increment correctable I-cache error counter in core
    * If I-cache error threshold reached, signal correctable error local interrupt (see Section 4.5.1)
    * Invalidate all cache lines of set
    * Perform RFPC flush
      * Flush core pipeline
      * Refetch cache line from SoC memory
  - * For all fetches from I-cache (i.e., out of pipeline, independent of actual instruction execution)
    * For I-cache with tag/instruction ECC protection, single and double-bit errors are recoverable
* - Fetch
  - Core
  - N/A
  - For ICCM accesses:
    * Increment correctable ICCM error counter in core
    * If ICCM error threshold reached, signal correctable error local interrupt (see Section 4.5.2)
    * Perform RFPC flush
      * Flush core pipeline
      * Write corrected data back to ICCM
      * Refetch instruction(s) from ICCM
  - * For all fetches from ICCM (i.e., out of pipeline, independent of actual instruction execution)
    * ICCM errors trigger an RFPC (ReFetch PC) flush since in-line correction would require an additional cycle
* - Fetch
  - Bus
  - N/A
  - * Increment correctable error counter in SoC
    * If error threshold reached, signal external interrupt
    * Write corrected data back to SoC memory
  - Errors in SoC memories are corrected at memory boundary and autonomously written back to memory array
* - Load
  - Core
  - No
  - * Increment correctable DCCM error counter in core
    * If DCCM error threshold reached, signal correctable error local interrupt (see Section 4.5.3)
    * Write corrected data back to DCCM
  - * For non-speculative accesses only
    * DCCM errors are in-line corrected and written back to DCCM
* - Load
  - Core
  - Yes
  - * Increment correctable DCCM error counter in core
    * If DCCM error threshold reached, signal correctable error local interrupt (see Section 4.5.3)
    * Write corrected data back to DCCM
  - * For non-speculative accesses only
    * DCCM errors are in-line corrected and written back to DCCM
* - Load
  - Bus
  - No
  - * Increment correctable error counter in SoC
    * If error threshold reached, signal external interrupt
    * Write corrected data back to SoC
  - Errors in SoC memories are corrected at memory boundary autonomously written back to memory array
* - Load
  - Bus
  - Yes
  - * Increment correctable error counter in SoC
    * If error threshold reached, signal external interrupt
    * Write corrected data back to SoC
  - Errors in SoC memories are corrected at memory boundary autonomously written back to memory array
* - Store
  - Core
  - No
  - * Increment correctable DCCM error counter in core
    * If DCCM error threshold reached, signal correctable error local interrupt (see Section 4.5.3)
    * Write corrected data back to DCCM
  - * For non-speculative accesses only
    * DCCM errors are in-line corrected and written back to DCCM
* - Store
  - Core
  - Yes
  - * Increment correctable DCCM error counter in core
    * If DCCM error threshold reached, signal correctable error local interrupt (see Section 4.5.3)
    * Write corrected data back to DCCM
  - * For non-speculative accesses only
    * DCCM errors are in-line corrected and written back to DCCM
* - Store
  - Bus
  - No
  - * Increment correctable error counter in SoC
    * If error threshold reached, signal external interrupt
    * Write corrected data back to SoC memory
  - Errors in SoC memories are corrected at memory boundary and autonomously written back to memory array
* - Store
  - Bus
  - Yes
  - * Increment correctable error counter in SoC
    * If error threshold reached, signal external interrupt
    * Write corrected data back to SoC memory
  - Errors in SoC memories are corrected at memory boundary and autonomously written back to memory array
* - DMA Read
  - Bus
  - N/A
  - For ICCM accesses:
    * Increment correctable ICCM error counter in core
    * If ICCM error threshold reached, signal correctable error local interrupt (see Section 4.5.2)
    * Write corrected data back to ICCM
  - DMA read access errors to ICCM are in-line corrected and written back to ICCM
* - DMA Read
  - Bus
  - N/A
  - For DCCM accesses:
    * Increment correctable DCCM error counter in core
    * If DCCM error threshold reached, signal correctable error local interrupt (see Section 4.5.3)
    * Write corrected data back to DCCM
  - DMA read access errors to DCCM are in-line corrected and written back to DCCM
:::

:::{note}
Counted errors could be from different, unknown memory locations.
:::

:::{note}
DMA write accesses to the ICCM or DCCM always overwrite entire 32-bit words and their corresponding ECC bits.
Therefore, ECC bits are never checked and errors not detected on DMA writes.
:::

## Control/Status Registers

A summary of platform-specific control/status registers in CSR space:

- Region Access Control Register (`mrac`) (see Section 3.8.1)
- D-Bus First Error Address Capture Register (`mdseac`) (see Section 3.8.3)
- Memory Synchronization Trigger Register (`dmst`) (see Section 3.8.2)
- D-Bus Error Address Unlock Register (`mdeau`) (see Section 3.8.4)

All reserved and unused bits in these control/status registers must be hardwired to '0'.
Unless otherwise noted, all read/write control/status registers must have WARL (Write Any value, Read Legal value) behavior.

### Region Access Control Register (mrac)

A single region access control register is sufficient to provide independent control for 16 address regions.

:::{note}
To guarantee that updates to the `mrac` register are in effect, if a region being updated is in the load/store space, a `fence` instruction is required.  Likewise, if a region being updated is in the instruction space, a `fencei.i` instruction (which flushes the I-cache) is required.
:::

:::{note}
The sideeffect access control bits are ignored by the core for load/store accesses to addresses mapped to core-local memories (i.e., DCCM and ICCM) and PIC memory-mapped control registers as well as for all instruction fetch accesses.
The cacheable access control bits are ignored for instruction fetch accesses from addresses mapped to the ICCM, but not for any other addresses.
:::

:::{note}
The combination '11' (i.e., side effect and cacheable) is illegal.
Writing '11' is mapped by hardware to the legal value '10' (i.e., side effect and non-cacheable).
:::

This register is mapped to the non-standard read/write CSR address space.

:::{list-table} **Region Access Control Register (mrac, at CSR 0x7C0)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Y = 0..15 (= Region)
  -
  -
  -
  -
* - sideeffect Y
  - Y *2+1
  - Side effect indication for region Y:
    * 0: No side effects (idempotent)
    * 1: Side effects possible (non-idempotent)
  - R/W
  - 0
* - cacheable Y
  - Y *2
  - Caching control for region Y:
    * 0: Caching not allowed
    * 1: Caching allowed
  - R/W
  - 0
:::

### Memory Synchronization Trigger Register (dmst)

The `dmst` register provides triggers to force the synchronization of memory accesses.
Specifically, it allows a debugger to initiate operations that are equivalent to the `fencei.i` (see Section 3.5.3.1) and `fence` (see Section 3.5.3.2) instructions.

:::{note}
This register is accessible in **Debug Mode only**.
Attempting to access this register in machine mode raises an illegal instruction exception.
:::

The *fence_i* and *fence* fields of the `dmst` register have W1R0 (Write 1, Read 0) behavior, as also indicated in the 'Access' column.

This register is mapped to the non-standard read/write CSR address space.

:::{list-table} **Memory Synchronization Trigger Register (dmst, at CSR 0x7C4)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31:2
  - Reserved
  - R
  - 0
* - `fence`
  - 1
  - Trigger operation equivalent to `fence` instruction
  - R0/W1
  - 0
* - fence_i
  - 0
  - Trigger operation equivalent to `fencei.i` instruction
  - R0/W1
  - 0
:::

### D-Bus First Error Address Capture Register (mdseac)

The address of the first occurrence of a store or non-blocking load error on the D-bus is captured in the `mdseac` register.
Latching the address also locks the register.
While the `mdseac` register is locked, subsequent D-bus errors are gated (i.e., they do not cause another NMI), but NMI requests originating external to the core are still honored.
The `mdseac` register is unlocked by either a core reset (which is the safer option) or by writing to the `mdeau` register (see Section 3.8.4).

:::{note}
The address captured in this register is the target (i.e., base) address of the store or non-blocking load which experienced an error.
:::

:::{note}
The NMI handler may use the value stored in the `mcause` register to differentiate between a D-bus store error, a D-bus non-blocking load error, and a core-external event triggering an NMI.
:::

This register is mapped to the non-standard read-only CSR address space.

:::{list-table} **D-Bus First Error Address Capture Register (mdseac, at CSR 0xFC0)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - erraddr
  - 31:0
  - Address of first occurrence of D-bus store or non-blocking load error
  - R
  - 0
:::

### D-Bus Error Address Unlock Register (mdeau)

Writing to the `mdeau` register unlocks the `mdseac` register (see Section 3.8.3) after a D-bus error address has been captured.
This write access also reenables the signaling of an NMI for a subsequent D-bus error.

:::{note}
Nested NMIs might destroy core state and, therefore, receiving an NMI should still be considered fatal.
Issuing a core reset is a safer option to deal with a D-bus error.
:::

The `mdeau` register has WAR0 (Write Any value, Read 0) behavior.
Writing '0' is recommended.

This register is mapped to the non-standard read/write CSR address space.

:::{list-table} **D-Bus Error Address Unlock Register (mdeau, at CSR 0xBC0)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31:0
  - Reserved
  - R0/WA
  - 0
:::

## Memory Address Map

Table 3-10 summarizes an example of the VeeR EH1 memory address map, including regions as well as start and end addresses for the various memory types.

:::{list-table} **VeeR EH1 Memory Address Map (Example)**
:header-rows: 1

* - Region
  - Start Address
  - End Address
  - Memory Type
* - 0x0
  - 0x0000_0000
  - 0x0003_FFFF
  - Reserved
* - 0x0
  - 0x0004_0000
  - 0x0005_FFFF
  - ICCM (region: 0, offset: 0x4000, size: 128KB)
* - 0x0
  - 0x0006_0000
  - 0x0007_FFFF
  - Reserved
* - 0x0
  - 0x0008_0000
  - 0x0009_FFFF
  - DCCM (region: 0, offset: 0x8000, size: 128KB)
* - 0x0
  - 0x000A_0000
  - 0x0FFF_FFFF
  - Reserved
* - 0x1
  - 0x1000_0000
  - 0x1FFF_FFFF
  - System memory-mapped CSRs
* - 0x2
  - 0x2000_0000
  - 0x2FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x3
  - 0x3000_0000
  - 0x3FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x4
  - 0x4000_0000
  - 0x4FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x5
  - 0x5000_0000
  - 0x5FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x6
  - 0x6000_0000
  - 0x6FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x7
  - 0x7000_0000
  - 0x7FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x8
  - 0x8000_0000
  - 0x8FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0x9
  - 0x9000_0000
  - 0x9FFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xA
  - 0xA000_0000
  - 0xAFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xB
  - 0xB000_0000
  - 0xBFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xC
  - 0xC000_0000
  - 0xCFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xD
  - 0xD000_0000
  - 0xDFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xE
  - 0xE000_0000
  - 0xEFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
* - 0xF
  - 0xF000_0000
  - 0xFFFF_FFFF
  - System SRAMs, system ROMs, and system memory-mapped I/O device interfaces
:::

## Partial Writes

Rules for partial writes handling are:

- **Core-local addresses**: The core performs a read-modify-write operation and updates ECC to core-local memories (i.e., I- and DCCMs).
- **SoC addresses**: The core indicates the valid bytes for each bus write transaction.  The addressed SoC memory or device performs a read-modify-write operation and updates its ECC.

## Expected SoC Behavior for Accesses

The VeeR EH1 core expects that the SoC responds to all system bus access requests it receives from the core.
System bus accesses include instruction fetches, load/store data accesses as well as debug system bus accesses.
A response may either be returning the requested data (e.g., instructions sent back to the core for fetches or data for loads), an acknowledgement indicating the successful completion of a bus transaction (e.g., acknowledging a store), or an error response (e.g., an error indication in response to an attempt to access an unmapped address).
If the SoC does not respond to every single bus transaction, the core may hang.

## Speculative Bus Accesses

Deep core pipelines require a certain degree of speculation to maximize performance.
The sections below describe instruction and data speculation in the VeeR EH1 core.

Note that speculative accesses to memory addresses with side effects may be entirely avoided by adding the buildargument-selected and -configured memory protection mechanism described in Section 3.6.

### Instructions

Instruction cache misses on VeeR EH1 are speculative in nature.
The core may issue speculatively fetch accesses on the IFU bus interface for an instruction cache miss in the following cases:

- due to an earlier exception or interrupt,
- due to an incorrect branch prediction, and
- due to an earlier branch mispredict,
- due to an incorrect Return Address Stack (RAS) prediction.

Issuing speculative accesses on the IFU bus interface is benign as long as the platform is able to handle accesses to unimplemented memory and to prevent accesses to SoC components with read side effects by returning random data and/or a bus error condition.
The decision of which addresses are unimplemented and which addresses with potential side effects need to be protected is left to the platform.

Instruction fetch speculation can be limited, though not entirely avoided, by turning off the core's branch predictor including the return address stack.
Writing a '1' to the *bpd* bit in the `mfdc` register (see Table 10-1) disables branch prediction including RAS.

### Data

The VeeR EH1 core does not issue any speculative data accesses on the LSU bus interface.

## DMA Slave Port

The Direct Memory Access (DMA) slave port is used for read/write accesses to core-local memories initiated by external masters.
For example, external masters could be DMA controllers or other CPU cores located in the SoC.

### Access

The DMA slave port allows read/write access to the core's ICCM and DCCM.
However, the PIC memory-mapped control registers are not accessible via the DMA port.

### Write Alignment Rules

For writes to the ICCM and DCCM through the DMA slave port, accesses must be 32- or 64-bit aligned, and 32 bits (word) or 64 bits (double-word), respectively, wide to avoid read-modify-write operations for ECC generation.

More specifically, DMA write accesses to the ICCM or DCCM must have a 32- or 64-bit access size and be aligned to their respective size.
The only write byte enable values allowed for AXI4 are 0x0F, 0xF0, and 0xFF.

### Quality of Service

Accesses to the ICCM and DCCM by the core have higher priority if the DMA FIFO is not full.
However, to avoid starvation, the DMA slave port's DMA controller may periodically request a stall to get access to the pipe if a DMA request is continuously blocked.

The *dqc* field in the `mfdc` register (see Table 10-1) specifies the maximum number of clock cycles a DMA access request waits at the head of the DMA FIFO before requesting a bubble to access the pipe.
For example, if *dqc* is 0, a DMA access requests a bubble immediately (i.e., in the same cycle); if *dqc* is 7 (the default value), a waiting DMA access requests a bubble on the 8-th  cycle.
For a DMA access to the ICCM, it may take up to 3 additional cycles [^16] before the access is granted.
Similarly, for a DMA access to the DCCM, it may take up to 4 additional cycles [^17] before the access is granted.

### Non-blocking DMA Control

DMA accesses to the VeeR EH1 core are stalled while a `fence` is pending or when the core freezes the pipeline due to a blocking load to external memory (i.e., either a side-effect load or a load with an instruction dependent on the load's data following within a two-cycle window).
Depending on the SoC, these DMA slave stall conditions may potentially lead to a timeout by the DMA master.

The *bldmad* bit of the `mfdc` register (see Table 10-1) controls if a DMA access is stalled by the conditions listed above, or if DMA accesses may neither be stalled by pending fences nor any loads to external memory (i.e., all loads are non-blocking).
The default setting is for these conditions to stall DMA accesses.

### Ordering of Core and DMA Accesses

Accesses to the DCCM or ICCM by the core and the DMA slave port are asynchronous events relative to one another.
There are no ordering guarantees between the core and the DMA slave port accessing the same or different addresses.

## Reset Signal and Vector

The core provides a 31-bit wide input bus at its periphery for a reset vector.
The SoC must provide the reset vector on the `rst_vec[31:1]` bus, which could be hardwired or from a register.
The `rst_l` input signal is active-low, asynchronously asserted, and synchronously deasserted (see also Section 15.3).
When the core is reset, it fetches the first instruction to be executed from the address provided on the reset vector bus.
Note that the applied reset vector must be pointing to the ICCM, if enabled, or a valid memory address, which is within an enabled instruction access window if the memory protection mechanism (see Section 3.6) is used.

:::{note}
The core's 31 general-purpose registers (`x1 -x31`) are cleared on reset.
:::

## Non-Maskable Interrupt (NMI) Signal and Vector

The core provides a 31-bit wide input bus at its periphery for a non-maskable interrupt (NMI) vector.
The SoC must provide the NMI vector on the `nmi_vec[31:1]` bus, either hardwired or sourced from a register.

:::{note}
NMI is entirely separate from the other interrupts and not affected by the selection of Direct vs Vectored mode.
:::

The SoC may trigger an NMI by asserting the low-to-high edge-triggered, asynchronous `nmi_int` input signal.
This signal must be asserted for at least two full core clock cycles to guarantee it is detected by the core since shorter pulses might be dropped by the synchronizer circuit.
Furthermore, the `nmi_int` signal must be deasserted for a minimum of two full core clock cycles and then reasserted to signal the next NMI request to the core.
If the SoC does not use the pin-asserted NMI feature, it must hardwire the `nmi_int` input signal to 0.

In addition to NMIs triggered by the SoC, a core-internal NMI request is signaled when a D-bus store or non-blocking load error has been detected.

When the core receives either an SoC-triggered or a core-internal NMI request, it fetches the next instruction to be executed from the address provided on the NMI vector bus.
The reason for the NMI request is reported in the `mcause` register according to Table 3-11.

:::{list-table} **Summary of NMI mcause Values**
:header-rows: 1

* - Value mcause[31:0]
  - Description
* - 0x0000_0000
  - NMI pin assertion (`nmi_int` input signal, see above)
* - 0xF000_0000
  - Machine D-bus store error NMI (see Section 3.7.1)
* - 0xF000_0001
  - Machine D-bus non-blocking load error NMI (see Section 3.7.1)
:::

:::{note}
NMIs are typically fatal!  Section 4.4 of the RISC-V Privileged specification [[2]](intro.md#ref-2) states that NMIs are only used for hardware error conditions and cause an immediate jump to the address at the NMI vector running in M-mode regardless of the state of a hart's interrupt enable bits.
The NMI can thus overwrite state in an active M-mode interrupt handler and normal program execution cannot resume.
Unlike resets, NMIs do not reset hart state, enabling diagnosis, reporting, and possible containment of the hardware error.
Because NMIs are not maskable, the NMI handling routine performing diagnosis and reporting is itself susceptible to further NMIs, possibly making any such activity meaningless and erroneous in the face of error storms.
:::

[^1]: DCCM only
[^2]: If any byte of an instruction is from an unmapped address, an instruction access fault precise exception is flagged.
[^3]: Exception also flagged for fetches to the DCCM address range if located in the same region, or if located in different regions and no SoC address is a match.
[^4]: Exception also flagged for PIC load/store not word-sized or address not word-aligned.
[^5]: Exception also flagged for loads/stores to the ICCM address range if located in the same region, or if located in different regions and no SoC address is a match.
[^6]: If *bldmad* bit of `mfdc` register is set (see Section 3.13.4 and Table 10-1).
[^7]: If *bldmad* bit of `mfdc` register is cleared (default) and instruction dependent on load's data following within a two-cycle window (see Section 3.13.4 and Table 10-1).
[^8]: If *bldmad* bit of `mfdc` register is cleared (default) (see Section 3.13.4 and Table 10-1).
[^9]: AMO refers to the RISC-V 'A' (atomics) extension, which is not implemented in VeeR EH1.
[^10]: Accesses to the I-cache or ICCM initiated by fetches never cross 16B boundaries. I-cache fills are always aligned to 64B. Misaligned accesses are therefore not possible.
[^11]: The RISC-V Privileged specification recommends that misaligned accesses to regions with potential side-effects should trigger an access fault exception, instead of a misaligned exception (see Section 4.5.6 in [[2]](intro.md#ref-2)). Note that VeeR EH1 triggers a misaligned exception in this case. To avoid potential side-effects, the exception handler should not emulate a misaligned access using multiple smaller aligned accesses.
[^12]: This case is in violation with the write alignment rules specified in Section 3.13.2.
[^13]: If *bldmad* bit of `mfdc` register is set (see Section 3.13.4 and Table 10-1).
[^14]: If *bldmad* bit of `mfdc` register is cleared (default) and instruction dependent on load's data following within a two-cycle window (see Section 3.13.4 and Table 10-1).
[^15]: If *bldmad* bit of `mfdc` register is cleared (default) (see Section 3.13.4 and Table 10-1).
[^16]: More cycles may be needed in the uncommon case of the pipe currently handling a correctable ECC error for a core fetch request, which needs to be finished first.
[^17]: If the core pipeline is currently frozen, the DMA access is further delayed until the freeze condition is resolved.
