module complex_coefficient_multiplier (clk, x_in, y_in, c_in, 
              cps_in, cms_in, r_out, i_out);

  parameter W2 = 17;   
  parameter W1 = 9;    
  parameter W  = 8;    

  input clk;  
  input [W-1:0] x_in, y_in, c_in;  
  input [W1-1:0]  cps_in, cms_in;  
  output [W-1:0] r_out, i_out;  
  reg [W-1:0] r_out, i_out;  

  wire [W-1:0] x, y, c ;            
  wire [W2-1:0] r, i, cmsy, cpsx, xmyc;    
  wire [W1-1:0] xmy, cps, cms;   
  wire [W1:0] sxtx, sxty;

  assign x = x_in;   
  assign y = y_in;   
  assign c = c_in;   
  assign cps = cps_in; 
  assign cms = cms_in; 

  always @(posedge clk) begin
    r_out <= r[W2-2:W];       
    i_out <= i[W2-2:W];   
  end

  assign sxtx = {x[W-1], x};     
  assign sxty = {y[W-1], y};     

  // Subtract sxtx - sxty
  assign xmy = sxtx - sxty;

  // Multiply xmy * c
  assign xmyc = xmy * c;

  // Multiply cms * y
  assign cmsy = cms * y;

  // Multiply cps * x
  assign cpsx = cps * x;

  // Add cmsy + xmyc
  assign r = cmsy + xmyc;

  // Subtract cpsx - xmyc
  assign i = cpsx - xmyc;

endmodule