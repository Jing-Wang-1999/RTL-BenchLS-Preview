# Interrupt Priorities

Table 14-1 summarizes the VeeR EH1 platform-specific (Local) and standard RISC-V (External and Timer) relative interrupt priorities.

:::{list-table} **VeeR EH1 Platform-specific and Standard RISC-V Interrupt Priorities**
:header-rows: 1

* - Priority
  - Interrupt
  - Section
* - Highest Interrupt Priority
  - Non-Maskable Interrupt (standard RISC-V)
  - 2.15
* -
  - External interrupt (standard RISC-V)
  - 6
* -
  - Correctable error (local interrupt)
  - 2.7.2
* -
  - Timer interrupt (standard RISC-V)
  -
* -
  - Internal timer 0 (local interrupt)
  - 4.3
* - Lowest Interrupt Priority
  - Internal timer 1 (local interrupt)
  - 4.3
:::
