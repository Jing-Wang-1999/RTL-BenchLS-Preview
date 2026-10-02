module io_timer_interrupt_controller_a (
	input        clk,           
	input        clk7_en,
	input        clk7n_en,
	input        aen,           
	input        rd,            
	input        wr,            
	input        reset,         
	input  [3:0] rs,            
	input  [7:0] data_in,       
	output [7:0] data_out,      
	input        tick,          
	input        eclk,          
	output       irq,           
	input  [7:2] porta_in,      
	output [3:0] porta_out,     
	input  [7:0] portb_in,      
	input        kms_level,
	input  [1:0] kbd_mouse_type,
	input  [7:0] kbd_mouse_data,
	output       freeze,        
	input        hrtmon_en
);

wire [7:0] icr_out;
wire [7:0] tmra_out;
wire [7:0] tmrb_out;
wire [7:0] tmrd_out;
wire [7:0] sdr_out;
reg  [7:0] pa_out;
reg  [7:0] pb_out;
wire [7:0] portb_out;
wire       alrm;        
wire       ta;          
wire       tb;          
wire       tmra_ovf;      
wire       spmode;        
wire       ser_tx_irq;      
reg  [3:0] ser_tx_cnt;   
reg        ser_tx_run;      
reg        tick_del;      

wire  pra, prb, ddra, ddrb, cra, talo, tahi, crb, tblo, tbhi, tdlo, tdme, tdhi, icrs, sdr;
wire  enable;

assign enable = aen & (rd | wr);

assign pra  = enable && rs == 4'h0;
assign prb  = enable && rs == 4'h1;
assign ddra = enable && rs == 4'h2;
assign ddrb = enable && rs == 4'h3;
assign talo = enable && rs == 4'h4;
assign tahi = enable && rs == 4'h5;
assign tblo = enable && rs == 4'h6;
assign tbhi = enable && rs == 4'h7;
assign tdlo = enable && rs == 4'h8;
assign tdme = enable && rs == 4'h9;
assign tdhi = enable && rs == 4'hA;
assign sdr  = enable && rs == 4'hC;
assign icrs = enable && rs == 4'hD;
assign cra  = enable && rs == 4'hE;
assign crb  = enable && rs == 4'hF;

assign data_out = icr_out | tmra_out | tmrb_out | tmrd_out | sdr_out | pb_out | pa_out;

reg        keystrobe;
reg  [7:0] sdr_latch;
reg        freeze_reg = 0;
assign freeze = freeze_reg;

always @(posedge clk) begin
	reg kms_levelD;
	if (clk7n_en) begin
		kms_levelD <= kms_level;
		keystrobe <= (kms_level ^ kms_levelD) && (kbd_mouse_type == 2);
	end
end

always @(posedge clk) begin
	if (reset) begin
		sdr_latch[7:0] <= 0;
		freeze_reg <= 0;
	end else if (clk7_en) begin
		if (keystrobe) begin
			sdr_latch[7:0] <= ~{kbd_mouse_data[6:0], kbd_mouse_data[7]};
			if (hrtmon_en && (kbd_mouse_data == 8'h5f)) freeze_reg <= 1;
			else freeze_reg <= 0;
		end else if (wr & sdr) sdr_latch[7:0] <= data_in[7:0];
	end
end

assign sdr_out = (!wr && sdr) ? sdr_latch[7:0] : 8'h00;

always @(posedge clk)
	if (clk7_en) begin
		if (reset || !spmode) 
			ser_tx_run <= 0;
		else if (sdr && wr) 
			ser_tx_run <= 1;
		else if (ser_tx_irq) 
			ser_tx_run <= 0;
	end

always @(posedge clk)
	if (clk7_en) begin
		if (!ser_tx_run)
			ser_tx_cnt <= 4'd0;
		else if (tmra_ovf) 
			ser_tx_cnt <= ser_tx_cnt + 4'd1;
	end

assign ser_tx_irq = &ser_tx_cnt & tmra_ovf; 

reg [7:2] porta_in2;
reg [3:0] regporta;
reg [7:0] ddrporta;

always @(posedge clk)
	if (clk7_en) begin
		porta_in2[7:2] <= porta_in[7:2];
	end

always @(posedge clk)
	if (clk7_en) begin
		if (reset)
			regporta[3:0] <= 4'd0;
		else if (wr && pra)
			regporta[3:0] <= {data_in[7:6], data_in[1:0]};
	end

always @(posedge clk)
	if (clk7_en) begin
		if (reset)
			ddrporta[7:0] <= 8'd0;
		else if (wr && ddra)
			ddrporta[7:0] <= data_in[7:0];
	end

always @(*)
begin
	if (!wr && pra)
		pa_out[7:0] = {porta_in2[7:2], porta_out[1:0]};
	else if (!wr && ddra)
		pa_out[7:0] = ddrporta[7:0];
	else
		pa_out[7:0] = 8'h00;
end

assign porta_out[3:0] = {(~ddrporta[7:6] | regporta[3:2]), (~ddrporta[1:0] | regporta[1:0])};

reg [7:0] ddrportb;

always @(posedge clk)
	if (clk7_en) begin
		if (reset)
			ddrportb[7:0] <= 8'd0;
		else if (wr && ddrb)
			ddrportb[7:0] <= (data_in[7:0]);
	end

always @(*)
begin
	if (!wr && prb)
		pb_out[7:0] = portb_in[7:0];
	else if (!wr && ddrb)
		pb_out[7:0] = (ddrportb[7:0]);
	else
		pb_out[7:0] = 8'h00;
end

always @(posedge clk)
	if (clk7_en) begin
		tick_del <= tick;
	end

// Simplification: Combining the logic of the external dependencies directly here

// ***** Interrupt Controller Logic *****
reg [7:0] icr;
assign icr_out = (!wr && icrs) ? icr : 8'h00;

always @(posedge clk)
	if (clk7_en) begin
		if (reset)
			icr <= 8'h00;
		else if (wr && icrs)
			icr <= data_in[7:0];
	end
assign irq = |icr[7:0] | ta | tb | alrm;

// ***** Timer A Logic *****
reg [15:0] tmrA;
reg [7:0] tmrAl, tmrAh;
assign tmra_out = (!wr && (talo || tahi)) ? (talo ? tmrAl : tmrAh) : 8'h00;

always @(posedge clk)
	if (clk7_en) begin
		if (reset) begin
			tmrA <= 16'd0;
			tmrAl <= 8'h00;
			tmrAh <= 8'h00;
		end else if (wr && talo)
			tmrA[7:0] <= data_in;
		else if (wr && tahi)
			tmrA[15:8] <= data_in;
	end

assign tmra_ovf = (tmrA == 16'h0000);
assign ta = tmra_ovf;

// ***** Timer B Logic *****
reg [15:0] tmrB;
reg [7:0] tmrBl, tmrBh;
assign tmrb_out = (!wr && (tblo || tbhi)) ? (tblo ? tmrBl : tmrBh) : 8'h00;

always @(posedge clk)
	if (clk7_en) begin
		if (reset) begin
			tmrB <= 16'd0;
			tmrBl <= 8'h00;
			tmrBh <= 8'h00;
		end else if (wr && tblo)
			tmrB[7:0] <= data_in;
		else if (wr && tbhi)
			tmrB[15:8] <= data_in;
	end

assign tb = (tmrB == 16'h0000);

// ***** Timer D Logic *****
reg [23:0] tmrD;
reg [7:0] tmrDl, tmrDm, tmrDh;
assign tmrd_out = (!wr && (tdlo || tdme || tdhi)) ? (tdlo ? tmrDl : tdme ? tmrDm : tmrDh) : 8'h00;

always @(posedge clk)
	if (clk7_en) begin
		if (reset) begin
			tmrD <= 24'd0;
			tmrDl <= 8'h00;
			tmrDm <= 8'h00;
			tmrDh <= 8'h00;
		end else if (wr && tdlo)
			tmrD[7:0] <= data_in;
		else if (wr && tdme)
			tmrD[15:8] <= data_in;
		else if (wr && tdhi)
			tmrD[23:16] <= data_in;
		else if (tick & ~tick_del)
			tmrD <= tmrD - 1;
	end

assign alrm = (tmrD == 24'h000000);

endmodule