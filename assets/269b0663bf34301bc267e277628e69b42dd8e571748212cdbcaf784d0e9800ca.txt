module single_port_sram_2048x128 (
                Q,
                CLK,
                CEN,
                WEN,
                A,
                D,
                EMA
                );
   parameter                BITS = 128;
   parameter                WORD_DEPTH = 2048;
   parameter                ADDR_WIDTH = 11;
   parameter                WORDX = {BITS{1'bx}};
   parameter                WORD1 = {BITS{1'b1}};
   parameter                ADDRX = {ADDR_WIDTH{1'bx}};
   parameter                ADDR1 = {ADDR_WIDTH{1'b1}};
   parameter                WEN_WIDTH = 1;
   parameter                WP_SIZE    = 128 ;
   parameter                RCOLS = 0;
   parameter                MASKX = {WEN_WIDTH{1'bx}};
   parameter                MASK1 = {WEN_WIDTH{1'b1}};
   parameter                MASK0 = {WEN_WIDTH{1'b0}};
   parameter                MUX = 8;
   parameter                COL_ADDR_WIDTH = 3;
   parameter                RROWS = 0;
   parameter                UPM_WIDTH = 3;
   parameter                UPM0 = {UPM_WIDTH{1'b0}};
   parameter                RCA_WIDTH = 1;
   parameter                RED_COLUMNS = 2;
  
   output [127:0]           Q;
   input                    CLK;
   input                    CEN;
   input                    WEN;
   input [10:0]             A;
   input [127:0]            D;
   input [2:0]              EMA;

   reg [BITS+RED_COLUMNS-1:0] mem [0:WORD_DEPTH-1];

   reg [127:0] latched_DO;

   always @(posedge CLK) begin
       if (~CEN) begin
           if (~WEN) begin
               mem[A] <= D;
           end else begin
               latched_DO <= mem[A];
           end
       end
   end

   assign Q = latched_DO;

endmodule