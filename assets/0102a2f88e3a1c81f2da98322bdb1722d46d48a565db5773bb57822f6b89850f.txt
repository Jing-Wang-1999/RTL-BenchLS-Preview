module empty_dma_channel_stub (
   input             clk,
   input             reset,
   input             scan_en,
   
   input             pclk,
   input             clken,
   input             pclken,
   input             psel,
   input             penable,
   input [7:0]       paddr,
   input             pwrite,
   input [31:0]      pwdata,
   output [31:0]     prdata,
   output            pslverr,
   
   input [31:1]      periph_tx_req,
   output [31:1]     periph_tx_clr,
   input [31:1]      periph_rx_req,
   output [31:1]     periph_rx_clr,

   input             rd_cmd_split,
   input             rd_cmd_line,
   input             rd_clr_line,
   input             rd_clr,
   input             rd_clr_load,
   input             rd_slverr,
   input             rd_decerr,

   input             wr_cmd_split,
   input             wr_cmd_pending,
   input             wr_clr_line,
   input             wr_clr,
   input             wr_clr_last,
   input             wr_slverr,
   input             wr_decerr,
   
   input             load_wr,
   input [1:0]       load_wr_cycle,
   input [63:0]      load_wdata,
   output            load_req_in_prog,
   
   output            int_all_proc,
   input             ch_start,
   output            idle,
   output            ch_active,
   output            ch_rd_active,
   output            ch_wr_active,
   output            wr_last_cmd,
   output            rd_line_cmd,
   output            wr_line_cmd,
   output            rd_go_next_line,
   output            wr_go_next_line,
   
   output            rd_ready,
   input             rd_burst_start,
   output [31:0]     rd_burst_addr,
   output [7:0]      rd_burst_size,
   output [3:0]      rd_tokens, // Assuming TOKEN_BITS is 4
   output            rd_port_num,
   output [3:0]      rd_periph_delay, // Assuming DELAY_BITS is 4
   output            rd_clr_valid,
   input             rd_transfer,
   input [3:0]       rd_transfer_size,
   output            rd_clr_stall,
   
   output            wr_ready,
   input             wr_burst_start,
   output [31:0]     wr_burst_addr,
   output [7:0]      wr_burst_size,
   output [3:0]      wr_tokens, // Assuming TOKEN_BITS is 4
   output            wr_port_num,
   output [3:0]      wr_periph_delay, // Assuming DELAY_BITS is 4
   output            wr_clr_valid,
   input             wr_transfer,
   input [3:0]       wr_transfer_size,
   input [3:0]       wr_next_size,
   output            wr_clr_stall,
   output            wr_incr,
   
   input             timeout_aw,
   input             timeout_w,
   input             timeout_ar,
   input             wdt_timeout,

   input             fifo_wr,
   input [63:0]      fifo_wdata,
   input [3:0]       fifo_wsize,
   
   input             fifo_rd,
   input [3:0]       fifo_rsize,
   
   output            fifo_rd_valid,
   output [63:0]     fifo_rdata,
   output            fifo_wr_ready,
   
   input             joint_mode,
   input             joint_remote,
   input             rd_page_cross,
   input             wr_page_cross,
   output            joint_in_prog,
   output            joint_not_in_prog,
   output            joint_mux_in_prog,
   output            joint_req
);

   assign             prdata            = 32'd0;
   assign             pslverr           = 1'b1; 
   assign             periph_tx_clr     = 31'd0;
   assign             periph_rx_clr     = 31'd0;
   assign             load_req_in_prog  = 1'b0;
   assign             int_all_proc      = 1'b0;
   assign             idle              = 1'b1;
   assign             ch_active         = 1'b0;
   assign             ch_rd_active      = 1'b0;
   assign             ch_wr_active      = 1'b0;
   assign             wr_last_cmd       = 1'b0;
   assign             rd_line_cmd       = 1'b0;
   assign             wr_line_cmd       = 1'b0;
   assign             rd_go_next_line   = 1'b0;
   assign             wr_go_next_line   = 1'b0;
   assign             rd_ready          = 1'b0;
   assign             rd_burst_addr     = 32'd0;
   assign             rd_burst_size     = 8'd0;
   assign             rd_tokens         = 4'd0;
   assign             rd_port_num       = 1'b0;
   assign             rd_periph_delay   = 4'd0;
   assign             rd_clr_valid      = 1'b0;
   assign             rd_clr_stall      = 1'b0;
   assign             wr_ready          = 1'b0;
   assign             wr_burst_addr     = 32'd0;
   assign             wr_burst_size     = 8'd0;
   assign             wr_tokens         = 4'd0;
   assign             wr_port_num       = 1'b0;
   assign             wr_periph_delay   = 4'd0;
   assign             wr_clr_valid      = 1'b0;
   assign             wr_clr_stall      = 1'b0;
   assign             wr_incr           = 1'b0;
   assign             fifo_rd_valid     = 1'b0;
   assign             fifo_rdata        = 64'd0;
   assign             fifo_wr_ready     = 1'b0;
   assign             joint_in_prog     = 1'b0;
   assign             joint_not_in_prog = 1'b0;
   assign             joint_mux_in_prog = 1'b0;
   assign             joint_req         = 1'b0;

endmodule