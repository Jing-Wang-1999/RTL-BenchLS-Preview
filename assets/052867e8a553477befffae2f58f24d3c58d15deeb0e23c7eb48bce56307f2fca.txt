# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   four_slave_axi_interconnect.v0, four_slave_axi_interconnect.v1, four_slave_axi_interconnect, aclk, -none
set DESIGN_NAME_GOLDEN "four_slave_axi_interconnect.v0"
set DESIGN_NAME "four_slave_axi_interconnect.v1"
set TOP_NAME "four_slave_axi_interconnect"


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
