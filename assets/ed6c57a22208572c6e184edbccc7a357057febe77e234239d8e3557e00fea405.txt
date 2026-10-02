# VeeR EH1 Core Overview

This chapter provides a high-level overview of the VeeR EH1 core and core complex.
VeeR EH1 is a machinemode (M-mode) only, 32-bit CPU core which supports RISC-V's integer (I), compressed instruction (C), multiplication and division (M), and instruction-fetch fence and CSR instructions (Z) extensions.
The core is a 9-stage, dual-issue, superscalar, mostly in-order pipeline with some out-of-order execution capability.

## Features

The VeeR EH1 core complex's feature set includes:

- RV32IMC-compliant RISC-V core with branch predictor
- Optional 4-way set-associative instruction cache with parity or ECC protection
- Optional instruction and data closely-coupled memories with ECC protection
- Optional programmable interrupt controller supporting up to 255 external interrupts
- Four system bus interfaces for instruction fetch, data accesses, debug accesses, and external DMA accesses to closely-coupled memories (configurable as 64-bit AXI4 or AHB-Lite)
- Core debug unit compliant with the RISC-V Debug specification [[3]](intro.md#ref-3)
- 1GHz target frequency (for 28nm technology node)

## Core Complex

Figure 2-1 depicts the core complex and its functional blocks which are described further in Section 2.3.

:::{figure} ./img/core_complex.png
:name: VeeR EH1 Core Complex

VeeR EH1 Core Complex
:::

## Functional Blocks

The VeeR EH1 core complex's functional blocks are described in the following sections in more detail.

### Core

Figure 2-2 depicts the superscalar, dual-issue 9-stage core pipeline supporting four arithmetic logic units (ALUs) labeled EX1 and EX4 in two pipelines I0 and I1, one load/store pipeline, one 3-cycle latency multiplier pipeline, and one out-of-pipeline 34-cycle latency divider.
There are four stall points in the pipeline: 'Fetch1', 'Align', 'Decode', and 'Commit'.
In the 'Align' stage, instructions are formed from 3 fetch buffers.
In the 'Decode' stage, up to 2 instructions from 4 instruction buffers are decoded.
In the 'Commit' stage, up to 2 instructions per cycle are committed.
Finally, in the 'Writeback' stage, the architectural registers are updated.

:::{figure} ./img/core_pipeline.png
:name: VeeR EH1 Core Pipeline

VeeR EH1 Core Pipeline
:::
