# Performance Monitoring

This chapter describes the performance monitoring features of the VeeR EH1 core.

## Features

VeeR EH1 provides these performance monitoring features:

- Four standard 64-bit wide event counters
- Standard separate event selection for each counter
- Standard selective count enable/disable controllability
- Synchronized counter enable/disable controllability
- Standard cycle counter
- Standard retired instructions counter
- Support for standard SoC-based machine timer registers

## Control/Status Registers

### Standard RISC-V Registers

A list of performance monitoring-related standard RISC-V CSRs with references to their definitions:

- Machine Hardware Performance Monitor (`mcycle{|h}, minstret{|h}, mhpmcounter3{|h}-mhpmcounter31{|h}, and mhpmevent3-mhpmevent31`) (see Section 4.1.11 in [[2]](intro.md#ref-2))
- Machine Timer Registers (`mtime` and `mtimecmp`) (see Section 4.1.10 in [[2]](intro.md#ref-2)) **Note:** `mtime` and `mtimecmp` are memory-mapped registers which must be provided by the SoC.

### Platform-specific Control/Status Registers

A summary of platform-specific control/status registers in CSR space:

- Group Performance Monitor Control Register (`mgpmc`) (see Section 8.2.2.1)

All reserved and unused bits in these control/status registers must be hardwired to '0'.
Unless otherwise noted, all read/write control/status registers must have WARL (Write Any value, Read Legal value) behavior.

#### Group Performance Monitor Control Register (mgpmc)

The `mgpmc` register allows to synchronously enable or disable the four machine hardware performance monitor counters mhpmcounter3 .. 6.
This register only controls if incrementing the counters on selected events is enabled or disabled, but does not affect the counter values of the hardware performance monitor counters (i.e., the counters are not reset or changed in any way).

This register is mapped to the non-standard read/write CSR address space.

:::{list-table} **Group Performance Monitor Control Register (mgpmc, at CSR 0x7D0)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31:1
  - Reserved
  - R
  - 0
* - enable
  - 0
  - Group performance monitor counter control (mhpmcounter3 .. 6):
    * 0: Disable incrementing of all performance monitor counters
    * 1: Enable incrementing of all performance monitor counters
  - R/W
  - 1
:::

## Counters

Only event counters 3 to 6 (`mhpmcounter3{|h}-mhpmcounter6{|h}`) and their corresponding event selectors (`mhpmevent3-mhpmevent6`) are functional on VeeR EH1.
Event counters 7 to 31 (`mhpmcounter7{|h}-mhpmcounter31{|h}`) and their corresponding event selectors (`mhpmevent7-mhpmevent31`) are hardwired to '0'.

## Count-Impacting Conditions

A few comments to consider on conditions that have an impact on the performance monitor counting:

- While in the pmu/fw-halt power management state, performance counters (including the mcycle counter) are disabled.
- While in the pmu/fw-halt power management state or the debug halt (db-halt) state with the *stopcount* bit set, DMA accesses are allowed, but not counted by the performance counters.
  It would be up to the bus master to count accesses while the core is in a halt state.
- While in debug halt (db-halt) state, the *stopcount* bit of the `dcsr` register (see Section 10.1.3.5) determines if performance counters are enabled.
- While executing PAUSE, performance counters are enabled.

Also, it is recommended that the performance counters are disabled (using the `mgpmc` register) before the counters and event selectors are modified, and then reenabled again.
This minimizes the impact of reading and writing the counter and event selector CSRs on the event count values, specifically for the CSR read/write events (i.e., events #16 and #17).
In general, performance counters are incremented after a read access to the counter CSRs, but before a write access to the counter CSRs.

## Events

Table 8-2 provides a list of the countable events.

:::{note}
The event selector registers `mhpmevent3-mhpmevent6` have WARL behavior.
When writing a value larger than the highest supported event number, the event selector is set to the highest event number.
:::

## Table 8-2

:::{list-table} **List of Countable Events**
:header-rows: 1

* - Event No
  - Event Name
  - Description
* - 0
  -
  - Reserved (no event counted)
* - 1
  - cycles clocks active
  - Number of cycles clock active (OOP)
* - 2
  - I-cache hits
  - Number of I-cache hits (OOP, speculative, valid fetch & hit)
* - 3
  - I-cache misses
  - Number of I-cache misses (OOP, valid fetch & miss)
* - 4
  - instr committed - all
  - Number of all (16b+32b) instructions committed (IP, non-speculative, 0/1/2)
* - 5
  - instr committed - 16b
  - Number of 16b instructions committed (IP, non-speculative, 0/1/2)
* - 6
  - instr committed - 32b
  - Number of 32b instructions committed (IP, non-speculative, 0/1/2)
* - 7
  - instr aligned - all
  - Number of all (16b+32b) instructions aligned (OOP, speculative, 0/1/2)
* - 8
  - instr decoded - all
  - Number of all (16b+32b) instructions decoded (OOP, speculative, 0/1/2)
* - 9
  - muls committed
  - Number of multiplications committed (IP, 0/1)
* - 10
  - divs committed
  - Number of divisions and remainders committed (IP, 0/1)
* - 11
  - loads committed
  - Number of loads committed (IP, 0/1)
* - 12
  - stores committed
  - Number of stores committed (IP, 0/1)
* - 13
  - misaligned loads
  - Number of misaligned loads (IP, 0/1)
* - 14
  - misaligned stores
  - Number of misaligned stores (IP, 0/1)
* - 15
  - alus committed
  - Number of ALU [^28] operations committed (IP, 0/1/2)
* - 16
  - CSR read
  - Number of CSR read instructions committed (IP, 0/1)
* - 17
  - CSR read/write
  - Number of CSR read/write instructions committed (IP, 0/1)
* - 18
  - CSR write rd==0
  - Number of CSR write rd==0 instructions committed (IP, 0/1)
* - 19
  - ebreak
  - Number of ebreak instructions committed (IP, 0/1)
* - 20
  - ecall
  - Number of ecall instructions committed (IP, 0/1)
* - 21
  - fence
  - Number of `fence` instructions committed (IP, 0/1)
* - 22
  - fencei.i
  - Number of `fencei.i` instructions committed (IP, 0/1)
* - 23
  - mret
  - Number of mret instructions committed (IP, 0/1)
* - 24
  - branches committed
  - Number of branches committed (IP)
* - 25
  - branches mispredicted
  - Number of branches mispredicted (IP)
* - 26
  - branches taken
  - Number of branches taken (IP)
* - 27
  - unpredictable branches
  - Number of unpredictable branches (IP)
* - 28
  - cycles fetch stalled
  - Number of cycles fetch ready but stalled (OOP)
* - 29
  - cycles aligner stalled
  - Number of cycles one or more instructions valid in aligner but IB full (OOP)
* - 30
  - cycles decode stalled
  - Number of cycles one or more instructions valid in IB but decode stalled (OOP)
* - 31
  - cycles postsync stalled
  - Number of cycles postsync stalled at decode (OOP)
* - 32
  - cycles presync stalled
  - Number of cycles presync stalled at decode (OOP)
* - 33
  - cycles frozen (lsu_freeze_dc3)
  - Number of cycles pipe is frozen by LSU (OOP)
* - 34
  - cycles SB/WB stalled (lsu_store_stall_any)
  - Number of cycles decode stalled due to SB or WB full (OOP)
* - 35
  - cycles DMA DCCM transaction stalled (dma_dccm_stall_any)
  - Number of cycles DMA stalled due to decode for load/store (OOP)
* - 36
  - cycles DMA ICCM transaction stalled (dma_iccm_stall_any)
  - Number of cycles DMA stalled due to fetch (OOP)
* - 37
  - exceptions taken
  - Number of exceptions taken (IP)
* - 38
  - timer interrupts taken
  - Number of timer [^29] interrupts taken (IP)
* - 39
  - external interrupts taken
  - Number of external interrupts taken (IP)
* - 40
  - TLU flushes (flush lower)
  - Number of TLU flushes (flush lower) (IP)
* - 41
  - branch error flushes
  - Number of branch error flushes (IP)
* - 42
  - I-bus transactions - instr
  - Number of instr transactions on I-bus interface (OOP)
* - 43
  - D-bus transactions - ld/st
  - Number of ld/st transactions on D-bus interface (OOP)
* - 44
  - D-bus transactions - misaligned
  - Number of misaligned transactions on D-bus interface (OOP)
* - 45
  - I-bus errors
  - Number of transaction errors on I-bus interface (OOP)
* - 46
  - D-bus errors
  - Number of transaction errors on D-bus interface (OOP)
* - 47
  - cycles stalled due to I-bus busy
  - Number of cycles stalled due to AXI4 or AHB-Lite I-bus busy (OOP)
* - 48
  - cycles stalled due to D-bus busy
  - Number of cycles stalled due to AXI4 or AHB-Lite D-bus busy (OOP)
* - 49
  - cycles interrupts disabled
  - Number of cycles interrupts disabled (MSTATUS.MIE==0) (OOP)
* - 50
  - cycles interrupts stalled while disabled
  - Number of cycles interrupts stalled while disabled (MSTATUS.MIE==0) (OOP)
:::
Legend: IP = In-Pipe; OOP = Out-Of-Pipe

[^28]: NOP is an ALU operation. WFI is implemented as a NOP in VeeR EH1 and, hence, counted as an ALU operation was well.
[^29]: Events counted include interrupts triggered by the standard RISC-V platform-level timer as well as by the two internal timers.
