# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   two_state_mealy_fsm.v0, two_state_mealy_fsm.v1, two_state_mealy_fsm, CLK, RST
set DESIGN_NAME_GOLDEN "two_state_mealy_fsm.v0"
set DESIGN_NAME "two_state_mealy_fsm.v1"
set TOP_NAME "two_state_mealy_fsm"


clear -all
check_sec -analyze -spec -sv ./input/rtl/${DESIGN_NAME_GOLDEN}.v
check_sec -analyze -imp -sv ./input/rtl/${DESIGN_NAME}.v
check_sec -elaborate -spec -top ${TOP_NAME} -disable_auto_bbox
check_sec -elaborate -imp -top ${TOP_NAME} -disable_auto_bbox
# check_sec -setup clock -infer reset -none
check_sec -setup 
check_sec -map -auto
clock CLK 
reset RST
check_sec -gen
# check_sec -prove -strategy design_style -design_style_type clock_gating
# check_sec -prove
check_sec -prove -strategy proof
