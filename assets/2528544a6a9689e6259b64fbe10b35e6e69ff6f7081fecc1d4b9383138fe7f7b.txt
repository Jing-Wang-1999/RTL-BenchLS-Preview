module signed_logarithmic_multiplier(dix, diy, iv, dox, doy, ov, clk, rst, gain);
    input [19:0] dix, diy;
    input iv;
    output [15:0] dox, doy;
    output ov;
    input clk;
    input rst;
    input [15:0] gain;

    reg [19:0] srx, sry;
    reg [3:0] sc;
    wire shift;
    reg [28:0] ax, ay;
    reg [11:0] gm;
    reg [12:0] m;
    wire add;
    wire load;
    reg [15:0] dx, dy;
    reg satx, saty;
    wire sx, sy;
    reg [14:0] v;

    always @ (posedge clk)
    begin
        if (iv) srx[19] <= dix[19];
        if (iv | shift) srx[18:0] <= iv ? dix[18:0] : {srx[17:0], 1'b0};
        if (iv) sry[19] <= diy[19];
        if (iv | shift) sry[18:0] <= iv ? diy[18:0] : {sry[17:0], 1'b0};
        if (rst) sc <= 0;
        else if (iv) sc <= gain[15:12];
        else if (shift) sc <= sc - 4'h1;
        if (rst) ax <= 0;
        else ax <= {ax[27:0], 1'b0} + (add ? {sx, sx, sx, sx, sx, sx, sx, sx, sx, sx, sx, sx, sx, srx[19:4]} : 29'd0);
        if (rst) ay <= 0;
        else ay <= {ay[27:0], 1'b0} + (add ? {sy, sy, sy, sy, sy, sy, sy, sy, sy, sy, sy, sy, sy, sry[19:4]} : 29'd0);
        if (iv) gm <= gain[11:0];
        if (rst) m <= 0;
        else m <= load ? {1'b1, gm} : {m[11:0], 1'b0};
        if (iv) satx <= 0;
        else if (shift) satx <= (srx[19] ^ srx[18]) | satx;
        if (iv) saty <= 0;
        else if (shift) saty <= (sry[19] ^ sry[18]) | saty;
        if (v[13]) dx <= (satx | (ax[27] ^ ax[28])) ? {sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, ~sx, 1'b1} : ax[27:12];
        if (v[13]) dy <= (saty | (ay[27] ^ ay[28])) ? {sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, ~sy, 1'b1} : ay[27:12];
    end

    assign sx = srx[19];
    assign sy = sry[19];
    assign shift = |sc;
    assign add = m[12];

    // Define a 16-stage shift register in Verilog
    reg [15:0] shift_reg;

    always @ (posedge clk)
    begin
        if (rst)
            shift_reg <= 16'b0;
        else
            shift_reg <= {shift_reg[14:0], iv};
    end

    assign load = shift_reg[gain[15:12]];

    always @ (posedge clk)
    begin
        if (rst)
            v <= 15'b0;
        else
            v <= {v[13:0], load};
    end

    assign dox = dx;
    assign doy = dy;
    assign ov = v[14];
endmodule