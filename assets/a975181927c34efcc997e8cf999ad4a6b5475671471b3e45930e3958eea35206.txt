# CSR Address Map

## Standard RISC-V CSRs

Table 13-1 lists the VeeR EH1 core-specific standard RISC-V Machine Information CSRs.

:::{list-table} **VeeR EH1 Core-Specific Standard RISC-V Machine Information CSRs**
:header-rows: 1

* - Number
  - Privilege
  - Name
  - Description
  - Value
* - 0x301
  - MRW
  - misa
  - ISA and extensions (**Note:** writes ignored)
  - 0x4000_1104
* - 0xF11
  - MRO
  - mvendorid
  - Vendor ID
  - 0x0000_0045
* - 0xF12
  - MRO
  - marchid
  - Architecture ID
  - 0x0000_000B
* - 0xF13
  - MRO
  - mimpid
  - Implementation ID
  - 0x0000_0006
* - 0xF14
  - MRO
  - mhartid
  - Hardware thread ID
  - 0x0000_0000
:::

Table 13-2 lists the VeeR EH1 standard RISC-V CSR address map.

:::{list-table} **VeeR EH1 Standard RISC-V CSR Address Map**
:header-rows: 1

* - Number
  - Privilege
  - Name
  - Description
  - Section
* - 0x300
  - MRW
  - mstatus
  - Machine status
  -
* - 0x304
  - MRW
  - mie
  - Machine interrupt enable
  - 11.1.1
* - 0x305
  - MRW
  - mtvec
  - Machine trap-handler base address
  -
* - 0x323
  - MRW
  - mhpmevent3
  - Machine performance-monitoring event selector 3
  -
* - 0x324
  - MRW
  - mhpmevent4
  - Machine performance-monitoring event selector 4
  -
* - 0x325
  - MRW
  - mhpmevent5
  - Machine performance-monitoring event selector 5
  - 7.2.1
* - 0x326
  - MRW
  - mhpmevent6
  - Machine performance-monitoring event selector 6
  -
* - 0x340
  - MRW
  - mscratch
  - Scratch register for machine trap handlers
  -
* - 0x341
  - MRW
  - mepc
  - Machine exception program counter
  -
* - 0x342
  - MRW
  - mcause
  - Machine trap cause
  - 11.1.2
* - 0x343
  - MRW
  - mtval
  - Machine bad address or instruction
  -
* - 0x344
  - MRW
  - mip
  - Machine interrupt pending
  - 11.1.1
* - 0x7A0
  - MRW
  - tselect
  - Debug/Trace trigger register select
  - 9.1.3.1
* - 0x7A1
  - MRW
  - tdata1
  - First Debug/Trace trigger data
  - 9.1.3.2
* - 0x7A1
  - MRW
  - mcontrol
  - Match control
  - 9.1.3.3
* - 0x7A2
  - MRW
  - tdata2
  - Second Debug/Trace trigger data
  - 9.1.3.4
* - 0x7B0
  - DRW
  - dcsr
  - Debug control and status register
  - 9.1.3.5
* - 0x7B1
  - DRW
  - dpc
  - Debug PC
  - 9.1.3.6
* - 0xB00
  - MRW
  - mcycle
  - Machine cycle counter
  - 7.2.1
* - 0xB02
  - MRW
  - minstret
  - Machine instructions-retired counter
  - 7.2.1
* - 0xB03
  - MRW
  - mhpmcounter3
  - Machine performance-monitoring counter 3
  - 7.2.1
* - 0xB04
  - MRW
  - mhpmcounter4
  - Machine performance-monitoring counter 4
  - 7.2.1
* - 0xB05
  - MRW
  - mhpmcounter5
  - Machine performance-monitoring counter 5
  - 7.2.1
* - 0xB06
  - MRW
  - mhpmcounter6
  - Machine performance-monitoring counter 6
  - 7.2.1
* - 0xB80
  - MRW
  - mcycleh
  - Upper 32 bits of `mcycle`, RV32I only
  - 7.2.1
* - 0xB82
  - MRW
  - minstreth
  - Upper 32 bits of `minstret`, RV32I only
  - 7.2.1
* - 0xB83
  - MRW
  - mhpmcounter3h
  - Upper 32 bits of `mhpmcounter3`, RV32I only
  - 7.2.1
* - 0xB84
  - MRW
  - mhpmcounter4h
  - Upper 32 bits of `mhpmcounter4`, RV32I only
  - 7.2.1
* - 0xB85
  - MRW
  - mhpmcounter5h
  - Upper 32 bits of `mhpmcounter5`, RV32I only
  - 7.2.1
* - 0xB86
  - MRW
  - mhpmcounter6h
  - Upper 32 bits of `mhpmcounter6`, RV32I only
  - 7.2.1
:::

## Non-Standard RISC-V CSRs

Table 13-3 summarizes the VeeR EH1 non-standard RISC-V CSR address map.

:::{list-table} **VeeR EH1 Non-Standard RISC-V CSR Address Map**
:header-rows: 1

* - Number
  - Privilege
  - Name
  - Description
  - Section
* - 0x7C0
  - MRW
  - mrac
  - Region access control
  - 2.8.1
* - 0x7C2
  - MRW
  - mcpc
  - Core pause control
  - 5.5.2
* - 0x7C4
  - DRW
  - dmst
  - Memory synchronization trigger (**Debug Mode only**)
  - 2.8.2
* - 0x7C6
  - MRW
  - mpmc
  - Power management control
  - 5.5.1
* - 0x7C8
  - DRW
  - dicawics
  - I-cache array/way/index selection (**Debug Mode only**)
  - 8.5.1
* - 0x7C9
  - DRW
  - dicad0
  - I-cache array data 0 (**Debug Mode only**)
  - 8.5.2
* - 0x7CA
  - DRW
  - dicad1
  - I-cache array data 1 (**Debug Mode only**)
  - 8.5.3
* - 0x7CB
  - DRW
  - dicago
  - I-cache array go (**Debug Mode only**)
  - 8.5.4
* - 0x7D0
  - MRW
  - mgpmc
  - Group performance monitor control
  - 7.2.2.1
* - 0x7D2
  - MRW
  - mitcnt0
  - Internal timer counter 0
  - 4.4.1
* - 0x7D3
  - MRW
  - mitb0
  - Internal timer bound 0
  - 4.4.2
* - 0x7D4
  - MRW
  - mitctl0
  - Internal timer control 0
  - 4.4.3
* - 0x7D5
  - MRW
  - mitcnt1
  - Internal timer counter 1
  - 4.4.1
* - 0x7D6
  - MRW
  - mitb1
  - Internal timer bound 1
  - 4.4.2
* - 0x7D7
  - MRW
  - mitctl1
  - Internal timer control 1
  - 4.4.3
* - 0x7F0
  - MRW
  - micect
  - I-cache error counter/threshold
  - 3.5.1
* - 0x7F1
  - MRW
  - miccmect
  - ICCM correctable error counter/threshold
  - 3.5.2
* - 0x7F2
  - MRW
  - mdccmect
  - DCCM correctable error counter/threshold
  - 3.5.3
* - 0x7F8
  - MRW
  - mcgc
  - Clock gating control
  - 10.1.2
* - 0x7F9
  - MRW
  - mfdc
  - Feature disable control
  - 10.1.1
* - 0xBC0
  - MRW
  - mdeau
  - D-Bus error address unlock
  - 2.8.4
* - 0xBC8
  - MRW
  - meivt
  - External interrupt vector table
  - 6.11.6
* - 0xBC9
  - MRW
  - meipt
  - External interrupt priority threshold
  - 6.11.5
* - 0xBCA
  - MRW
  - meicpct
  - External interrupt claim ID / priority level capture trigger
  - 6.11.8
* - 0xBCB
  - MRW
  - meicidpl
  - External interrupt claim ID's priority level
  - 6.11.9
* - 0xBCC
  - MRW
  - meicurpl
  - External interrupt current priority level
  - 6.11.10
* - 0xFC0
  - MRO
  - mdseac
  - D-bus first error address capture
  - 2.8.3
* - 0xFC8
  - MRO
  - meihap
  - External interrupt handler address pointer
  - 6.11.7
:::
