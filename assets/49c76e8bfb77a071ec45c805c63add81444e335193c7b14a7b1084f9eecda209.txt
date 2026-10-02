# Cache Control

This chapter describes the features to control the VeeR EH1 core's instruction cache (I-cache).

## Features

The VeeR EH1's I-cache control features are:

- Flushing the I-cache
- Capability to enable/disable I-cache
- Diagnostic access to data, tag, and status information of the I-cache

:::{note}
The I-cache is an optional core feature.
Instantiation of the I-cache is controlled by the RV\_ICACHE\_ENABLE build argument.
:::

## Feature Descriptions

### Cache Flushing

As described in Section 3.8.2, a debugger may initiate an operation that is equivalent to a `fence.i` instruction by writing a '1' to the *fence_i* field of the `dmst` register.
As part of executing this operation, the I-cache is flushed (i.e., all entries in the I-cache are invalidated).

### Enabling/Disabling I-Cache

As described in Section 3.8.1, each of the 16 memory regions has two control bits which are hosted in the `mrac` register.
One of these control bits, `cacheable`, controls if accesses to that region may be cached.
If the `cacheable` bits of all 16 regions are set to '0', the I-cache is effectively turned off.

### Diagnostic Access

For firmware as well as hardware debug, direct access to the raw content of the data array, tag array, and status bits of the I-cache may be important.
Instructions stored in the cache, the tag of a cache line as well as status information including a line's valid bit and a set's LRU bits can be manipulated.
It is also possible to inject a parity/ECC error in the data or tag array to check error recovery.
Four control registers are used to provide read/write diagnostic access to the two arrays and status bits.
The `dicawics` register controls the selection of the array, way, and index of a cache line.
The `dicad0/1` and `dicago` registers are used to perform a read or write access to the selected array location.
See Sections 9.5.1 - 9.5.4 for more detailed information.

:::{note}
The instructions and the tags are stored in parity/ECC-protected SRAM arrays.
The status bits are stored in flops.
:::

## Use Cases

The I-cache control features can be broadly divided into two categories:

1. **Debug Support**
  A few examples how diagnostic accesses (Section 9.2.3) may be useful for debug:
    - Generating an I-cache dump (e.g., to investigate performance issues).
    - Diagnosing stuck-at bits in the data or tag array of the I-cache.
    - Injecting parity/ECC errors in the data or tag array of the I-cache.
    - Preloading the I-cache if a hardware bug prevents instruction fetching from memory.
2. **Performance Evaluation**
  To evaluate the performance advantage of the I-cache, it is useful to run code with and without the cache enabled.
  Enabling and disabling the I-cache (Section 9.2.2) is an essential feature for this.

## Theory of Operation

### Read a Chunk of an I-cache Cache Line

The following steps must be performed to read a 32-bit chunk of instruction data and its associated 2 parity / 10 ECC bits in an I-cache cache line:

1. Write array/way/address information which location to access in the I-cache to the `dicawics` register:
  - *array* field: 0 (i.e., I-cache data array),
  - *way* field: way to be accessed (i.e., 0..3), and
  - *index* field: index of cache line to be accessed.
2. Read the `dicago` register which causes a read access from the I-cache data array at the location selected by the `dicawics` register.
3. Read the `dicad0` register to get the selected 32-bit cache line chunk (*instr* field), and read the `dicad1` register to get the associated parity/ECC bits (*parity0* and *parity1/ecc0* and *ecc1* fields).

### Write a Chunk of an I-cache Cache Line

The following steps must be performed to write a 32-bit chunk of instruction data and its associated 2 parity / 10 ECC bits in an I-cache cache line:

1. Write array/way/address information which location to access in the I-cache to the `dicawics` register:
  - *array* field: 0 (i.e., I-cache data array),
  - *way* field: way to be accessed (i.e., 0..3), and
  - *index* field: index of cache line to be accessed.
2. Write the new instruction information to the *instr* field of the `dicad0` register, and write the calculated correct instruction parity/ECC bits (unless error injection should be performed) to the *parity0* and *parity1/ecc0* and *ecc1* fields of the `dicad1` register.
3. Write a '1' to the *go* field of the `dicago` register which causes a write access to the I-cache data array copying the information stored in the `dicad0/1` registers to the location selected by the `dicawics` register.

### Read or Write a Full I-cache Cache Line

The following steps must be performed to read or write instruction data and associated parity/ECC bits of a full Icache cache line:

1. Start with an index naturally aligned to the 64-byte cache line size (i.e., index[5:2] = '0000').
2. Perform steps in Section 9.4.1 to read or Section 9.4.2 to write.
3. Increment the index.
4. Go back to step 2.\) for a total of 16 iterations.

### Read a Tag and Status Information of an I-cache Cache Line

The following steps must be performed to read the tag, tag's parity/ECC bit(s), and status information of an I-cache cache line:

1. Write array/way/address information which location to access in the I-cache to the `dicawics` register:
  - *array* field: 1 (i.e., I-cache tag array and status),
  - *way* field: way to be accessed (i.e., 0..3), and
  - *index* field: index of cache line to be accessed.
2. Read the `dicago` register which causes a read access from the I-cache tag array and status bits at the location selected by the `dicawics` register.
3. Read the `dicad0` register to get the selected cache line's tag (*tag* field) and valid bit (*valid* field) as well as the set's LRU bits (*lru* field), and read the `dicad1` register to get the tag's parity/ECC bit(s) (*parity0/ecc0* field).

### Write a Tag and Status Information of an I-cache Cache Line

The following steps must be performed to write the tag, tag's parity/ECC bit, and status information of an I-cache cache line:

1. Write array/way/address information which location to access in the I-cache to the `dicawics` register:
  - *array* field: 1 (i.e., I-cache tag array and status),
  - *index* field: index of cache line to be accessed.
  - *way* field: way to be accessed (i.e., 0..3), and
2. Write the new tag, valid, and LRU information to the *tag*, *valid*, and *lru* fields of the `dicad0` register, and write the calculated correct tag parity/ECC bit (unless error injection should be performed) to the *parity0/ecc0* field of the `dicad1` register.
3. Write a '1' to the *go* field of the `dicago` register which causes a write access to the I-cache tag array and status bits copying the information stored in the `dicad0/1` registers to the location selected by the `dicawics` register.

## I-Cache Control/Status Registers

A summary of the I-cache control/status registers in CSR address space:
  - I-Cache Array/Way/Index Selection Register (`dicawics`) (see Section 9.5.1)
  - I-Cache Array Data 0 Register (`dicad0`) (see Section 9.5.2)
  - I-Cache Array Data 1 Register (`dicad1`) (see Section 9.5.3)
  - I-Cache Array Go Register (`dicago`) (see Section 9.5.4)

All reserved and unused bits in these control/status registers must be hardwired to '0'.
Unless otherwise noted, all read/write control/status registers must have WARL (Write Any value, Read Legal value) behavior.

### I-Cache Array/Way/Index Selection Register (dicawics)

The `dicawics` register is used to select a specific location in either the data array or the tag array / status of the Icache.
In addition to selecting the array, the location in the array must be specified by providing the way, and index.
Once selected, the `dicad0/1` registers (see Sections 9.5.2 and 9.5.3) hold the information read from or to be written to the specified location, and the `dicago` register (see Section 9.5.4) is used to control the read/write access to the specified I-cache array.

The cache line size of the I-cache is 64 bytes.
The `dicawics` register addresses two chunks consisting each of 16 consecutive bits of instruction data and separately protected by parity/ECC bits.
There are 16 such chunk pairs in a cache line.


:::{note}
This register is accessible in **Debug Mode only**.
Attempting to access this register in machine mode raises an illegal instruction exception.
:::

This register is mapped to the non-standard read-write CSR address space.

:::{list-table} **I-Cache Array/Way/Index Selection Register (dicawics, at CSR 0x7C8)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - Reserved
  - 31:25
  - Reserved
  - R
  - 0
* - array
  - 24
  - Array select:
    * 0: I-cache data array (including parity/ECC bits)
    * 1: I-cache tag array (including parity/ECC bits) and status (including valid and LRU bits)
  - R/W
  - 0
* - Reserved
  - 23:22
  - Reserved
  - R
  - 0
* - way
  - 21:20
  - Way select
  - R/W
  - 0
* - Reserved
  - 19:16
  - Reserved
  - R
  - 0
* - index [^30]
  - 15:2
  - Index address bits select
    * **Notes:**
      * Index bits are right-justified; for I-cache sizes smaller than 256 KB, unused upper bits are 0.
      * For tag array and status, bits 5..2 are ignored by hardware.
      * This field does not have WARL behavior.
  - R/W
  - 0
* - Reserved
  - 1:0
  - Reserved
  - R
  - 0
:::

### I-Cache Array Data 0 Register (dicad0)

The `dicad0` register, in combination with the `dicad1` register (see Section 9.5.3), is used to store information read

from or to be written to the I-cache array location specified with the `dicawics` register (see Section 9.5.1).
Triggering a read or write access of the I-cache array is controlled by the `dicago` register (see Section 9.5.4).
The layout of the `dicad0` register is different for the data array and the tag array / status, as described in Table 9-2 below.

:::{note}
During normal operation, the parity/ECC bits over the 32-bit instruction data as well as the tag are generated and checked by hardware.
However, to enable error injection, the parity/ECC bits must be computed by software for I-cache data and tag array diagnostic writes.
:::

:::{note}
This register is accessible in **Debug Mode only**.
Attempting to access this register in machine mode raises an illegal instruction exception.
:::

This register is mapped to the non-standard read-write CSR address space.

:::{list-table} **I-Cache Array Data 0 Register (dicad0, at CSR 0x7C9)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - **I-cache data array**
  -
  -
  -
  -
* - instr
  - 31:0
  - Instruction data
    * 31:16: instruction data bytes 3/2 (protected by `parity1` / `ecc1`)
    * 15:0: instruction data bytes 1/0 (protected by `parity0` / `ecc0`)
  - R/W
  - 0
* - **I-cache tag array and status bits**
  -
  -
  -
  -
* - tag
  - 31:12
  - Tag
    * **Note:** Tag bits are right-justified; for I-cache sizes larger than 16 KB, unused higher bits are 0.
  - R/W
  - 0
* - Unused
  - 11:7
  - Unused
  - R/W
  - 0
* - lru
  - 6:4
  - Pseudo LRU bits (same bits are accessed independent of selected way):
    * Bit 4: way0/1 / way2/3 selection
      * 0: way0/1
      * 1: way2/3
    * Bit 5: way0 / way1 selection
      * 0: way0
      * 1: way1
    * Bit 6: way2 / way3 selection
      * 0: way2
      * 1: way3
  - R/W
  - 0
* - Unused
  - 3:1
  - Unused
  - R/W
  - 0
* - valid
  - 0
  - Cache line valid/invalid:
    * 0: cache line invalid
    * 1: cache line valid
  - R/W
  - 0
:::

### I-Cache Array Data 1 Register (dicad1)

The `dicad1` register, in combination with the `dicad0` register (see Section 9.5.2), is used to store information read from or to be written to the I-cache array location specified with the `dicawics` register (see Section 9.5.1).
Triggering a read or write access of the I-cache array is controlled by the `dicago` register (see Section 9.5.4).
The layout of the `dicad1` register is described in Table 9-3 below.

:::{note}
During normal operation, the parity/ECC bits over the 32-bit instruction data as well as the tag are generated and checked by hardware.
However, to enable error injection, the parity/ECC bits must be computed by software for I-cache data and tag array diagnostic writes.
:::

:::{note}
This register is accessible in **Debug Mode only**.
Attempting to access this register in machine mode raises an illegal instruction exception.
:::

This register is mapped to the non-standard read-write CSR address space.

:::{list-table} **I-Cache Array Data 1 Register (dicad1, at CSR 0x7CA)**
:header-rows: 1

* - Field
  - Bits
  - Description
  - Access
  - Reset
* - **Parity**
  - **Parity**
  - **Parity**
  - **Parity**
  - **Parity**
* - Reserved
  - 31:2
  - Reserved
  - R
  - 0
* - parity1
  - 1
  - Even parity for I-cache data bytes 3/2 (`instr[31:16]`)
  - R/W
  - 0
* - parity0
  - 0
  - Even parity for I-cache data bytes 1/0 (`instr[15:0]`), or even parity for the I-cache tag (`tag`)
  - R/W
  - 0
* - **ECC**
  - **ECC**
  - **ECC**
  - **ECC**
  - **ECC**
* - Reserved
  - 31:10
  - Reserved
  - R
  - 0
* - ecc1
  - 9:5
  - ECC for I-cache data bytes 3/2 (`instr[31:16]`)
  - R/W
  - 0
* - ecc0
  - 4:0
  - ECC for I-cache data bytes 1/0 (`instr[15:0]`), or ECC for the I-cache tag (`tag`)
  - R/W
  - 0
:::

### I-Cache Array Go Register (dicago)

The `dicago` register is used to trigger a read from or write to the I-cache array location specified with the `dicawics` register (see Section 9.5.1).
Reading the `dicago` register populates the `dicad0/dicad1` registers (see Sections 9.5.2 and 9.5.3) with the information read from the I-cache array.
Writing a '1' to the *go* field of the `dicago` register copies the information stored in the `dicad0/dicad1` registers to the I-cache array.
The layout of the `dicago` register is described in Table 9-4 below.

:::{note}
This register is accessible in **Debug Mode only**.
Attempting to access this register in machine mode raises an illegal instruction exception.
:::

The *go* field of the `dicago` register has W1R0 (Write 1, Read 0) behavior, as also indicated in the 'Access' column.

This register is mapped to the non-standard read-write CSR address space.

:::{list-table} **I-Cache Array Go Register (dicago, at CSR 0x7CB)**
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
* - go
  - 0
  - Read triggers an I-cache read, write-1 triggers an I-cache write
  - R0/W1
  - 0
:::

[^30]: VeeR EH1’s I-cache supports four-way set-associativity, each way is subdivided into 4 banks, and each bank hosts 16 bytes of a 64-byte cache line. A bank is selected by index[5:4]. The 16 bytes within a bank are selected by index[3:2] in increasing 32-bit chunk pairs (i.e., ‘00’: bytes 3..0, ‘01’: bytes 7..4, ‘10’: bytes 11..8, and ‘11’: bytes 15..12).
