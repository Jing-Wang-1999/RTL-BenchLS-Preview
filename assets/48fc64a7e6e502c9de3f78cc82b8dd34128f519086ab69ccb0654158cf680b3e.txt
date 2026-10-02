# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   axi_lite_protocol_bridge.v0, axi_lite_protocol_bridge.v1, axi_lite_protocol_bridge, aclk, -none
set DESIGN_NAME_GOLDEN "axi_lite_protocol_bridge.v0"
set DESIGN_NAME "axi_lite_protocol_bridge.v1"
set TOP_NAME "axi_lite_protocol_bridge"


clear -all
check_sec -analyze -spec -sv ./input/rtl/${DESIGN_NAME_GOLDEN}.v
check_sec -analyze -imp -sv ./input/rtl/${DESIGN_NAME}.v
check_sec -elaborate -spec -top ${TOP_NAME} -disable_auto_bbox
check_sec -elaborate -imp -top ${TOP_NAME} -disable_auto_bbox
# check_sec -setup clock -infer reset -none
check_sec -setup 
check_sec -map -auto
clock aclk 
reset -none
check_sec -gen
# check_sec -prove -strategy design_style -design_style_type clock_gating
# check_sec -prove
check_sec -prove -strategy proof
