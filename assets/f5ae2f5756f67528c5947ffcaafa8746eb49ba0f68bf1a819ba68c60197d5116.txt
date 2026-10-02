module axi_protocol_converter_5(
  input aclk,
  input aresetn,
  input [12:0] s_axi_awaddr,
  input [7:0] s_axi_awlen,
  input [2:0] s_axi_awsize,
  input [1:0] s_axi_awburst,
  input [0:0] s_axi_awlock,
  input [3:0] s_axi_awcache,
  input [2:0] s_axi_awprot,
  input [3:0] s_axi_awregion,
  input [3:0] s_axi_awqos,
  input s_axi_awvalid,
  output reg s_axi_awready,
  input [31:0] s_axi_wdata,
  input [3:0] s_axi_wstrb,
  input s_axi_wlast,
  input s_axi_wvalid,
  output reg s_axi_wready,
  output reg [1:0] s_axi_bresp,
  output reg s_axi_bvalid,
  input s_axi_bready,
  input [12:0] s_axi_araddr,
  input [7:0] s_axi_arlen,
  input [2:0] s_axi_arsize,
  input [1:0] s_axi_arburst,
  input [0:0] s_axi_arlock,
  input [3:0] s_axi_arcache,
  input [2:0] s_axi_arprot,
  input [3:0] s_axi_arregion,
  input [3:0] s_axi_arqos,
  input s_axi_arvalid,
  output reg s_axi_arready,
  output reg [31:0] s_axi_rdata,
  output reg [1:0] s_axi_rresp,
  output reg s_axi_rlast,
  output reg s_axi_rvalid,
  input s_axi_rready,
  output reg [12:0] m_axi_awaddr,
  output reg [2:0] m_axi_awprot,
  output reg m_axi_awvalid,
  input m_axi_awready,
  output reg [31:0] m_axi_wdata,
  output reg [3:0] m_axi_wstrb,
  output reg m_axi_wvalid,
  input m_axi_wready,
  input [1:0] m_axi_bresp,
  input m_axi_bvalid,
  output reg m_axi_bready,
  output reg [12:0] m_axi_araddr,
  output reg [2:0] m_axi_arprot,
  output reg m_axi_arvalid,
  input m_axi_arready,
  input [31:0] m_axi_rdata,
  input [1:0] m_axi_rresp,
  input m_axi_rvalid,
  output reg m_axi_rready
);

  // Example of internal logic.
  always @(posedge aclk) begin
    if (!aresetn) begin
      s_axi_awready <= 0;
      s_axi_wready <= 0;
      s_axi_bresp <= 2'b00;
      s_axi_bvalid <= 0;
      s_axi_arready <= 0;
      s_axi_rdata <= 0;
      s_axi_rresp <= 2'b00;
      s_axi_rlast <= 0;
      s_axi_rvalid <= 0;
      m_axi_awaddr <= 0;
      m_axi_awprot <= 0;
      m_axi_awvalid <= 0;
      m_axi_wdata <= 0;
      m_axi_wstrb <= 0;
      m_axi_wvalid <= 0;
      m_axi_bready <= 0;
      m_axi_araddr <= 0;
      m_axi_arprot <= 0;
      m_axi_arvalid <= 0;
      m_axi_rready <= 0;
    end else begin
      // AXI write address channel
      if (s_axi_awvalid && !s_axi_awready) begin
        s_axi_awready <= 1;
        m_axi_awaddr <= s_axi_awaddr;
        m_axi_awprot <= s_axi_awprot;
        m_axi_awvalid <= s_axi_awvalid;
      end else begin
        s_axi_awready <= 0;
        m_axi_awvalid <= 0;
      end

      // AXI write data channel
      if (s_axi_wvalid && s_axi_awready) begin
        s_axi_wready <= 1;
        m_axi_wdata <= s_axi_wdata;
        m_axi_wstrb <= s_axi_wstrb;
        m_axi_wvalid <= s_axi_wvalid;
      end else begin
        s_axi_wready <= 0;
        m_axi_wvalid <= 0;
      end

      // AXI write response channel
      if (m_axi_bvalid && s_axi_awready) begin
        s_axi_bresp <= m_axi_bresp;
        s_axi_bvalid <= m_axi_bvalid;
        if (s_axi_bready) begin
          s_axi_bvalid <= 0;
        end
      end

      // AXI read address channel
      if (s_axi_arvalid && !s_axi_arready) begin
        s_axi_arready <= 1;
        m_axi_araddr <= s_axi_araddr;
        m_axi_arprot <= s_axi_arprot;
        m_axi_arvalid <= s_axi_arvalid;
      end else begin
        s_axi_arready <= 0;
        m_axi_arvalid <= 0;
      end

      // AXI read data channel
      if (m_axi_rvalid && s_axi_arready) begin
        s_axi_rdata <= m_axi_rdata;
        s_axi_rresp <= m_axi_rresp;
        s_axi_rvalid <= m_axi_rvalid;
        s_axi_rlast <= 1;
        if (s_axi_rready) begin
          s_axi_rvalid <= 0;
          s_axi_rlast <= 0;
        end
      end
    end
  end

endmodule