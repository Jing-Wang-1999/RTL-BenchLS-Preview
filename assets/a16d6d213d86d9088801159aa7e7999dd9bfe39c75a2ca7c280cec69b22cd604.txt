![CHIPS Alliance logo](img/chips_alliance_logo.png)

# RISC-V VeeR EH1 Programmer's Reference Manual

**Revision 1.9 December 22, 2022**


Licensed under Apache-2.0

SPDX-License-Identifier: Apache-2.0 Copyright © 2022 CHIPS Alliance.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.

## Document Revision History

:::{list-table}
:header-rows: 1

* - Revision
  - Date
  - Contents
* - 1.0
  - Jan 24, 2019
  - Initial revision
* - 1.1
  - May 31, 2019
  - * Updated 'Reference Documents' table:
      * Updated link and version number of RISC-V ISA spec
      * Updated link and version number of RISC-V Privileged spec, updated section references throughout text
      * Added link and version number of last RISC-V Privileged spec with PLIC chapter
      * Fixed URL and updated version number of RISC-V Debug spec
    * Added core pipeline summary (Section 2.3.1)
    * Corrected load-to-load ordering description (Section 3.5.1)
    * Added section on 'Bus Barrier' mechanism (Section 3.5.3.3) and updated instructions and data fencing sections accordingly (Sections 3.5.3.1 and 3.5.3.2)
    * Added section on 'Memory Protection' mechanism (Section 3.6)
    * Updated note when `mrac` access control bits are ignored (Section 3.8.1)
    * Clarified note how writing illegal value to `mrac` register is handled by hardware (Section 3.8.1)
    * Added region number to field names of `mrac` register to make them unique (Table 3-6)
    * Changed field name *fence.i* in `dmst` register to *fence_i* to avoid potential compatibility issues with tools (Table 3-7)
    * Added section on 'Speculative Bus Accesses' (Section 3.12)
    * Updated DMA QoS description (Section 3.13.3)
    * Added note that applied reset vector must be to valid and enabled memory address (Section 3.14)
    * Updated NMI description and added table of mcause values (Section 3.15)
    * Clarified comment about stuck-at bits (Section 4.4)
    * Corrected note regarding correctable error local interrupt not being latched (Sections 4.5.1, 4.5.2, and 4.5.3)
    * Updated Power Management chapter (Chapter 6):
      * Changed title to 'Power Management and Multi-Core Debug Control'
      * Added brief descriptions of power management unit (PMU) and multi-processor debug control (MPC) interfaces (Section 6.2)
      * Clarified that only highest-priority external interrupt wakes up core (Figure 6-1)
      * Updated note describing 'Core Quiesced' (Section 6.3)
      * Added notes how to tie off input signals if PMU interface not used (Table 6-3)
      * Added notes how to tie off input signals if MPC interface not used (Table 6-4)
      * Updated cross-reference to `mhwakeup` signal description to be more precise (Section 6.4.7)
    * Clarified vectored external interrupt handler selection steps (Section 7.6)
    * Added source ID to field names of `meip`*X* register to make them unique (Table 7-3)
    * Clarified that event counting of division instructions includes remainder instructions (Table 8-2)
    * Fixed note on tag alignment (Table 9-2)
    * Updated `mfdc` register definition (Table 11-1):
      * Updated field descriptions
      * Assigned names to fields
      * Added 'DMA QoS control' field
      * Added 'side effect posted disable' bit
      * Removed 'PIC multiple interrupts disable' bit (was bit 9)
      * Removed 'Load miss bypass Write Buffer (WB) disable' bit (was bit 1)
    * Updated `mcgc` register definition (Table 11-2):
      * Updated field descriptions
      * Assigned names to fields
    * Improved clarity of `mcause` value table (Table 12-3)
    * Updated asynchronous signals (Table 15-1):
      * Removed core output signals
      * Added that JTAG signals are synchronous to TCK
      * Added asynchronous MPC interface signals
    * Updated port list (Table 16-1):
      * Removed '(async)' label from core output signals
      * Added missing DMA Slave AHB-Lite bus signals
      * Added MPC interface signals
      * Updated performance counter activity signals
      * Added that JTAG signals are synchronous to TCK
      * Added `jtag_id` port
    * Added 'Memory Protection Build Arguments' (Section 17.1)
    * Updated 'Errata' chapter (Chapter 19):
      * Added 'Back-to-back Write Transactions Not Supported on AHB-Lite Bus' section
      * Removed 'Core May Handle Write Transactions with Different Transaction IDs Incorrectly on AXI System Bus' section, issue has been fixed
* - 1.2
  - Aug 13, 2019
  - * Updated bus barrier description (Section 3.5.3.3)
    * Updated ICCM/DCCM error detection and handling details (Table 3-4 and Table 3-5)
    * Added clarification that ordering between core and DMA accesses is not guaranteed (Section 3.13.5)
    * Updated ICCM/DCCM recovery/logging details (Table 4-2)
    * Clarified that correctable errors on DMA reads to ICCM/DCCM are counted (Sections 4.5.2 and 4.5.3)
    * Clarified that correctable DCCM errors counted only for retired load/store instructions (Section 4.5.3)
    * Changed 'RV_' prefix to '`RV_' (Table 15-1)
    * Updated port list (Table 16-1):
    * Changed 'RV_' prefix to '`RV_'
    * Added 'core_rst_l` signal
    * Removed 'mbist_mode' signal
* - 1.5
  - Feb 14, 2020
  - * Added footnote that PIC access errors also included (Table 3-2)
    * Clarified that correctable error local interrupt is level signaled (Sections 4.5.1, 4.5.2, and 4.5.3)
    * Fixed scope of Debug Mode in Core Activity States diagram (Figure 6-1)
    * Added several clarifications on MPC interface restrictions:
      * Halt/run request typically allowed only when not in requested state already (Section 6.3)
      * Signaling same request multiple times not allowed (Table 6-4)
      * Conditions when requests are acknowledged (Section 6.4.2.2)
      * After reset to Debug Mode, run request only allowed after core is in Debug Mode (Section 6.4.2.2)
    * Added Single Stepping section (Section 6.4.1.1)
    * Amended note regarding signaling PMU halt/run request when already in that state (Section 6.4.2.1)
    * Added note that interrupts must be disabled while changing some interrupt registers (Section 7.5)
    * Updated `mimpid` register value to '2' (Table 13-1)
    * Added standard CSR address map (Table 13-2)
    * Updated port list (Table 16-1):
      * Added `dbg_rst_l` signal
      * Removed `core_rst_l` signal (signal on core periphery, but not core complex periphery)
      * Removed `sb_axi_arsize` bus description comment indicating *'hardwired'*
      * Added `mbist_mode` signal (signal on core complex periphery, but not core periphery)
    * Added 'Compliance Test Suite Failures' chapter (Chapter 18)
* - 1.5.1
  - Feb 28, 2020
  - * Added note that uninitialized DCCM may cause loads to get incorrect data (Section 4.4)
    * Added Debug Module reset description (Section 15.3.2)
    * Added footnote clarifying trace port signals (Table 16-1)
    * Added erratum for access register abstract command size check issue (Section 17.3)
* - 1.6
  - May 15, 2020
  - * Added footnote that misaligned accesses to side-effect regions trigger a misaligned exception instead of the recommended access fault exception (Table 3-3)
    * Fixed note how writing illegal value to `mrac` register is handled by hardware (Section 3.8.1)
    * Added Internal Timers chapter and references throughout document (Chapter 5)
    * Added cross-references to debug CSR descriptions (Table 6-2, Table 6-4, Table 13-2, and Sections 8.4 and 15.3.4)
    * Added Debug Support chapter (Chapter 10)
    * Incremented `mimpid` register value from '2' to '3' (Table 13-1)
    * Updated 'Errata' chapter (Chapter 19):
      * Removed erratum for debug access register abstract command issue (fixed) (was Section 17.2)
      * Removed erratum for access register abstract command size check issue (fixed) (was Section 17.3)
      * Added erratum for debug write to minstret register issue (Section 19.2)
      * Added erratum for abstract command register read capability (Section 19.3)
* - 1.7
  - Jun 25, 2020
  - * Updated versions of RISC-V Base ISA [[1]](intro.md#ref-1) and Privileged [[2]](intro.md#ref-2) documents (Reference Documents)
    * Added description of SoC access expectation (Section 3.11)
    * Added note that `mitcnt0/1` register is cleared if internal timer interrupt coincides with write to it (Section 5.4.1)
    * Amended `debug_mode_status` signal description (Table 6-4)
    * Clarified effect of *sespd* bit of `mfdc` register (Table 11-1)
    * Debug Support chapter updates (Chapter 10):
      * Fixed 'Access' of JTAG `BYPASS` register since not directly accessible (Table 10-5)
      * Fixed abstract command register definition (Table 10-11):
        * Changed 'W' accesses to 'R0/W'
        * Fixed *aarsize* and *aamsize* field descriptions that command error is '2'
        * Updated *aarpostincrement, postexec, transfer, and aampostincrement* bit descriptions including error behavior
        * Added note to *aamvirtual* bit description that no error is flagged
      * Fixed reset value of *sbaccess* field (Table 10-14)
      * Updated description of *sbautoincrement* field that only incrementing for successful accesses (Table 10-14)
      * Added note that no bus transaction is issued on debug execute address trigger for side-effect load (Table 10-20)
      * Added footnote that bit 0 is ignored for instruction address matches (Table 10-20 and Table 10-21)
    * Incremented `mimpid` register value from '3' to '4' (Table 13-1)
* - 1.8
  - Sep 18, 2020
  - * Added note that NMIs are fatal (Section 3.15)
    * Clarified note that debug single-step action is delayed while MPC debug halted (Section 6.3)
    * Added note that debug single-stepping stays pending while MPC debug halted (Section 6.4.1.1)
    * Added note that `mpc_debug_run_req` is required to exit Debug Mode if entered after reset using `mpc_reset_run_req` (Section 6.4.2.2)
    * Added *haltie* control bit to `mpmc` register (Section 6.5.1)
    * Added note that edge-triggered interrupt lines must be tied off to inactive state (Section 7.3.2)
    * Removed outdated 'Full Hardware Implementation of Vectored External Interrupts' section (was Section 7.6.1)
    * Fixed gateway initialization macro example (Section 7.14.2)
    * Added note that `mtime` and `mtimecmp` registers must be provided by SoC (Section 8.2.1)
    * Added note that *index* field does not have WARL behavior (Table 9-1)
    * Added notes that abstract commands may only be executed when core is in debug halt state (Sections 10.1.2 and 10.1.2.5)
    * Added notes that system bus accesses are allowed irrespective of core's state (Sections 10.1.2 and 10.1.2.8)
    * Added description of abstract command enhancements:
      * Updated notes that SoC memory locations are accessible using access memory abstract command as well (Sections 10.1.2 and 10.1.2.5)
      * Updated *cmderr* field description (Table 10-10)
      * Updated abstract command description (Table 10-11):
        * Clarified that selecting unsupported abstract command causes failure
        * Updated *aarsize* and *aamsize* field descriptions
        * Updated *aarpostincrement* and *aampostincrement* bit descriptions
        * Updated *regno* field description
      * Added `abstractauto` register (Section 10.1.2.6)
      * Added note that selecting unmapped access memory abstract command address causes failure (Section 10.1.2.7)
      * Added footnote to *aamvirtual* bit documenting why no command error is reported (Table 10-11)
    * Added description of `sbaddress0` register write access action and error condition behavior (Section 10.1.2.9)
    * Corrected description of `sbdata0` register read and write access action (Section 10.1.2.10)
    * Clarified that triggering on load data or executed instruction opcode not supported (Section 10.1.3.3 and Table 10-20)
    * Clarified that triggers do not fire if *action* is '0' and interrupts disabled (Table 10-20)
    * Updated `tdata2` register description (Table 10-21)
    * Incremented `mimpid` register value from '4' to '5' (Table 13-1)
    * Updated 'Reset to Debug-Mode' description (Section 15.3.4)
* - 1.9
  - Feb 2, 2022
  - * Updated link to RISC-V Debug [[3]](intro.md#ref-3) specification (Reference Documents)
    * Added non-blocking side-effect loads to unmapped address and uncorrectable error tables (Table 3-2 and Table 3-4)
    * Added note to `mdseac` register description clarifying captured address (Section 3.8.3)
    * Clarified DMA write access size and alignment (Section 3.13.2)
    * Added non-blocking DMA control section (Section 3.13.4)
    * Clarified that correctable error counter/threshold registers are always instantiated (Sections 4.5.1, 4.5.2, and 4.5.3)
    * Added note that spurious interrupts may be captured for disabled external interrupts (Section 7.3.2)
    * Updated `mcontrol` register (Table 10-20):
      * Clarified *hit* bit description
      * Updated *sizelo* field description and clarified that only '0' is implemented
      * Updated *chain* bit description with how hardware handles register writes with inter-trigger dependencies
      * Changed *chain* bit for triggers 1 and 3 to read-only
    * Updated `mfdc` register (Table 11-1):
      * Added blocking loads/DMA control (*bldmad*) bit
      * Changed *dnbd* bit to control DIV only, but not loads
    * Added note regarding physical design considerations for `rst_l` signal (Section 15.3.1)
    * Incremented `mimpid` register value from '5' to '6' (Table 13-1)
:::

## Reference Documents

:::{list-table} Reference Documents
:name: tab-reference-documents
:header-rows: 1

* - **Item #**
  - **Document**
  - **Revision Used**
  - **Comment**
* - <a name="ref-1"></a>1
  - The RISC-V Instruction Set Manual  Volume I: User-Level ISA
  - 20190608-Base-Ratified
  - Specification ratified
* - <a name="ref-2"></a>2
  - The RISC-V Instruction Set Manual  Volume II: Privileged Architecture
  - 20190608-Priv-MSU-Ratified
  - Specification ratified
* - <a name="ref-2-plic"></a>2 (PLIC)
  - The RISC-V Instruction Set Manual Volume II: Privileged Architecture
  - 1.11-draft
    December 1, 2018
  - Last specification version with PLIC chapter
* - <a name="ref-3"></a>3
  - RISC-V External Debug Support
  - 0.13.2
  - Specification ratified
:::

## Abbreviations

:::{list-table}
:header-rows: 1

* - Abbreviation
  - Description
* - AHB
  - Advanced High-performance Bus (by ARM®)
* - AMBA
  - Advanced Microcontroller Bus Architecture (by ARM)
* - ASIC
  - Application Specific Integrated Circuit
* - AXI
  - Advanced eXtensible Interface (by ARM)
* - CCM
  - Closely Coupled Memory (= TCM)
* - CPU
  - Central Processing Unit
* - CSR
  - Control and Status Register
* - DCCM
  - Data Closely Coupled Memory (= DTCM)
* - DEC
  - DECoder unit (part of core)
* - DMA
  - Direct Memory Access
* - DTCM
  - Data Tightly Coupled Memory (= DCCM)
* - ECC
  - Error Correcting Code
* - EXU
  - EXecution Unit (part of core)
* - ICCM
  - Instruction Closely Coupled Memory (= ITCM)
* - IFU
  - Instruction Fetch Unit
* - ITCM
  - Instruction Tightly Coupled Memory (= ICCM)
* - JTAG
  - Joint Test Action Group
* - LSU
  - Load/Store Unit (part of core)
* - NMI
  - Non-Maskable Interrupt
* - PIC
  - Programmable Interrupt Controller
* - PLIC
  - Platform-Level Interrupt Controller
* - POR
  - Power-On Reset
* - RAM
  - Random Access Memory
* - RAS
  - Return Address Stack
* - ROM
  - Read-Only Memory
* - SECDED
  - Single-bit Error Correction/Double-bit Error Detection
* - SEDDED
  - Single-bit Error Detection/Double-bit Error Detection
* - SoC
  - System on Chip
* - TBD
  - To Be Determined
* - TCM
  - Tightly Coupled Memory (= CCM)
:::
