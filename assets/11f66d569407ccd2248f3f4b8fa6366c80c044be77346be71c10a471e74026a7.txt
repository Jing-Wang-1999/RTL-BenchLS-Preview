module ble_packet_memory (
    input Clock,
    input ClockEn,
    input Reset,
    input WE,
    input [7:0] Address,
    input [7:0] Data,
    output reg [7:0] Q
);   
    wire scuba_vlo;
    wire VCC_net;

    assign scuba_vlo = 1'b0;
    assign VCC_net = 1'b1;

    reg [8:0] mem [0:255];
    reg [7:0] read_address;

    // Write logic
    always @(posedge Clock) begin
        if (ClockEn) begin
            if (WE) begin
                mem[Address] <= {scuba_vlo, Data};
            end
            read_address <= Address;
        end
    end

    // Output logic
    always @(posedge Clock) begin
        if (ClockEn) begin
            if (!Reset) begin
                Q <= mem[read_address][7:0];
            end else begin
                Q <= 0;
            end
        end
    end

    // Initialization
    integer i;
    initial begin
        for (i = 0; i < 256; i = i + 1)
            mem[i] = 9'b0;
    end
endmodule