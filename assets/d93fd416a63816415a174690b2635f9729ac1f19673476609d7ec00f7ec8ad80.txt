# Standard RISC-V CSRs with Core-Specific Adaptations

A summary of standard RISC-V control/status registers in CSR space with platform-specific adaptations:

- Machine Interrupt Enable (`mie`) and Machine Interrupt Pending (`mip`) Registers (see Section 12.1.1)
- Machine Cause Register (`mcause`) (see Section 12.1.2)

All reserved and unused bits in these control/status registers must be hardwired to '0'.
Unless otherwise noted, all read/write control/status registers must have WARL (Write Any value, Read Legal value) behavior.

### Machine Interrupt Enable (mie) and Machine Interrupt Pending (mip) Registers

The standard RISC-V `mie` and `mip` registers hold the machine interrupt enable and interrupt pending bits, respectively.
Since VeeR EH1 only supports machine mode, all supervisor and user-specific bits are not implemented.
In addition, the `mie/mip` registers also host the platform-specific local interrupt enable/pending bits (shown in bold in Table 12-1 and Table 12-2 below).

:::{list-table} **Machine Interrupt Enable Register (mie, at CSR 0x304)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31
  - Reserved
  - R
  - 0
* - **mceie**
  - **30**
  - **Correctable error local interrupt enable**
  - **R/W**
  - **0**
* - **mitie0**
  - **29**
  - **Internal timer 0 local interrupt enable**
  - **R/W**
  - **0**
* - **mitie1**
  - **28**
  - **Internal timer 1 local interrupt enable**
  - **R/W**
  - **0**
* - Reserved
  - 27:12
  - Reserved
  - R
  - 0
* - meie
  - 11
  - Machine external interrupt enable
  - R/W
  - 0
* - Reserved
  - 10:8
  - Reserved
  - R
  - 0
* - mtie
  - 7
  - Machine timer interrupt enable
  - R/W
  - 0
* - Reserved
  - 6:4
  - Reserved
  - R
  - 0
* - msie
  - 3
  - Machine software interrupt enable
  - R/W
  - 0
* - Reserved
  - 2:0
  - Reserved
  - R
  - 0
:::

:::{list-table} **Machine Interrupt Pending Register (mip, at CSR 0x344)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31
  - Reserved
  - R
  - 0
* - mceip
  - 30
  - Correctable error local interrupt pending
  - R
  - 0
* - mitip0
  - 29
  - Internal timer 0 local interrupt pending
  - R
  - 0
* - mitip1
  - 28
  - Internal timer 1 local interrupt pending
  - R
  - 0
* - Reserved
  - 27:12
  - Reserved
  - R
  - 0
* - meip
  - 11
  - Machine external interrupt pending
  - R
  - 0
* - Reserved
  - 10:8
  - Reserved
  - R
  - 0
* - mtip
  - 7
  - Machine timer interrupt pending
  - R
  - 0
* - Reserved
  - 6:0
  - Reserved
  - R
  - 0
:::

### Machine Cause Register (mcause)

The standard RISC-V `mcause` register indicates the cause for a trap as shown in Table 12-3, including standard exceptions/interrupts, platform-specific local interrupts (shown in italic), and NMI causes (shown in bold).

:::{note}
The `mcause` register has WLRL (Write Legal value, Read Legal value) behavior.
:::

:::{list-table} **Machine Cause Register (mcause, at CSR 0x342)**
:header-rows: 1

* - Type
  - Trap Code
  - Value mcause[31:0]
  - Description
  - Section(s)
* - **NMI**
  - **N/A**
  - **0x0000_0000**
  - **NMI pin assertion**
  - **2.15**
* - Exception
  - 1
  - 0x0000_0001
  - Instruction access fault
  - 2.7.4, 2.7.6, and 3.4
* - Exception
  - 2
  - 0x0000_0002
  - Illegal instruction
  -
* - Exception
  - 3
  - 0x0000_0003
  - Breakpoint
  -
* - Exception
  - 4
  - 0x0000_0004
  - Load address misaligned
  - 2.7.5
* - Exception
  - 5
  - 0x0000_0005
  - Load access fault
  - 2.7.4, 2.7.6, and 3.4
* - Exception
  - 6
  - 0x0000_0006
  - Store/AMO address misaligned
  - 2.7.5
* - Exception
  - 7
  - 0x0000_0007
  - Store/AMO access fault
  - 2.7.4, 2.7.6, and 3.4
* - Exception
  - 11
  - 0x0000_000B
  - Environment call from M-mode
  -
* - Interrupt
  - 7
  - 0x8000_0007
  - Machine timer [^36] interrupt
  -
* - Interrupt
  - 11
  - 0x8000_000B
  - Machine external interrupt
  -
* - Interrupt
  - *28*
  - *0x8000_001C*
  - *Machine internal timer 1 local interrupt*
  - *4.3*
* - Interrupt
  - *29*
  - *0x8000_001D*
  - *Machine internal timer 0 local interrupt*
  - *4.3*
* - Interrupt
  - *30*
  - *0x8000_001E*
  - *Machine correctable error local interrupt*
  - *2.7.2*
* - **NMI**
  - **N/A**
  - **0xF000_0000**
  - **Machine D-bus store error NMI**
  - **2.7.1 and 2.15**
* - **NMI**
  - **N/A**
  - **0xF000_0001**
  - **Machine D-bus non-blocking load error NMI**
  - **2.7.1 and 2.15**
:::

:::{note}
All other values are reserved.
:::

[^36]: Core external timer
