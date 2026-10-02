module three_sensor_interface (
    input wire        clock,
    input wire        reset,
    input wire        medir,
    input wire        echo,
    output wire       trigger,
    output wire [6:0] hex0,
    output wire [6:0] hex1,
    output wire [6:0] hex2,
    output wire       pronto,
    output wire       db_medir,
    output wire       db_echo,
    output wire       db_trigger,
    output wire [6:0] db_estado
);

    wire        s_medir  ;
    wire        s_trigger;
    wire [11:0] s_medida ;
    wire [3:0]  s_estado ;

    // Logic for interface_hcsr04
    reg [11:0] medida_reg;
    reg pronto_reg;
    reg [3:0] estado_reg;
    
    always @(posedge clock or posedge reset) begin
        if (reset) begin
            medida_reg <= 12'b0;
            pronto_reg <= 1'b0;
            estado_reg <= 4'b0;
        end else begin
            // Add necessary control logic for interface_hcsr04
            // This is a placeholder; implement specific logic as required
            medida_reg <= medida_reg + 1;
            pronto_reg <= 1'b1;
            estado_reg <= estado_reg + 1;
        end
    end

    assign s_trigger = echo; // Placeholder; implement specific logic as required
    assign pronto = pronto_reg;
    assign s_medida = medida_reg;
    assign s_estado = estado_reg;

    // Logic for hexa7seg
    function [6:0] hexa_to_seg;
        input [3:0] hexa;
        begin
            case (hexa)
                4'h0: hexa_to_seg = 7'b1000000;
                4'h1: hexa_to_seg = 7'b1111001;
                // Include other hex to 7-segment conversions
                4'h2: hexa_to_seg = 7'b0100100;
                4'h3: hexa_to_seg = 7'b0110000;
                4'h4: hexa_to_seg = 7'b0011001;
                4'h5: hexa_to_seg = 7'b0010010;
                4'h6: hexa_to_seg = 7'b0000010;
                4'h7: hexa_to_seg = 7'b1111000;
                4'h8: hexa_to_seg = 7'b0000000;
                4'h9: hexa_to_seg = 7'b0010000;
                4'hA: hexa_to_seg = 7'b0001000;
                4'hB: hexa_to_seg = 7'b0000011;
                4'hC: hexa_to_seg = 7'b1000110;
                4'hD: hexa_to_seg = 7'b0100001;
                4'hE: hexa_to_seg = 7'b0000110;
                4'hF: hexa_to_seg = 7'b0001110;
                default: hexa_to_seg = 7'b1111111;
            endcase
        end
    endfunction

    assign hex0 = hexa_to_seg(s_medida[3:0]);
    assign hex1 = hexa_to_seg(s_medida[7:4]);
    assign hex2 = hexa_to_seg(s_medida[11:8]);
    assign db_estado = hexa_to_seg(s_estado);

    // Edge detector logic for debouncing
    reg medir_ff1, medir_ff2;
    
    always @(posedge clock or posedge reset) begin
        if (reset) begin
            medir_ff1 <= 1'b0;
            medir_ff2 <= 1'b0;
        end else begin
            medir_ff1 <= medir;
            medir_ff2 <= medir_ff1;
        end
    end

    assign s_medir = medir_ff1 & ~medir_ff2;

    assign trigger = s_trigger;
    assign db_echo = echo;
    assign db_trigger = s_trigger;
    assign db_medir = medir;

endmodule