module axi_slave_bus_functional_model (
   
   awready, wready, bid, bresp, bvalid, arready, rid, rdata, rresp,
   rlast, rvalid,
   
   aclk, aresetn, awid, awadr, awlen, awsize, awburst, awlock,
   awcache, awprot, awvalid, wid, wrdata, wstrb, wlast, wvalid,
   bready, arid, araddr, arlen, arsize, arlock, arcache, arprot,
   arvalid, rready
   ) ;

   // Inputs
   input aclk;
   input aresetn;   
   input [3:0] awid;     
   input [31:0] awadr;   
   input [3:0]  awlen;   
   input [2:0]  awsize;  
   input [1:0]  awburst; 
   input [1:0]  awlock;  
   input [3:0]  awcache; 
   input [2:0]  awprot;  
   input        awvalid; 
   input [3:0]  wid;     
   input [31:0] wrdata;  
   input [3:0]  wstrb;   
   input        wlast;   
   input        wvalid;  
   input        bready; 
   input [3:0]  arid;    
   input [31:0] araddr;  
   input [3:0]  arlen;   
   input [2:0]  arsize;  
   input [1:0]  arlock;  
   input [3:0]  arcache; 
   input [2:0]  arprot;  
   input        arvalid; 
   input        rready;  
   
   // Outputs
   output reg        awready; 
   output reg        wready;  
   output reg [3:0]  bid;    
   output reg [1:0]  bresp;  
   output reg        bvalid; 
   output reg        arready; 
   output reg [3:0]  rid;     
   output reg [31:0] rdata;   
   output reg [1:0]  rresp;   
   output reg        rlast;   
   output reg        rvalid;  
   
endmodule