# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   pushbutton_debouncer_a.v0, pushbutton_debouncer_a.v1, pushbutton_debouncer_a, CLK, RESET
set DESIGN_NAME_GOLDEN "pushbutton_debouncer_a.v0"
set DESIGN_NAME "pushbutton_debouncer_a.v1"
set TOP_NAME "pushbutton_debouncer_a"


clear -all
check_sec -analyze -spec -sv ./input/rtl/${DESIGN_NAME_GOLDEN}.v
check_sec -analyze -imp -sv ./input/rtl/${DESIGN_NAME}.v
check_sec -elaborate -spec -top ${TOP_NAME} -disable_auto_bbox
check_sec -elaborate -imp -top ${TOP_NAME} -disable_auto_bbox
# check_sec -setup clock -infer reset -none
check_sec -setup 
check_sec -map -auto
clock CLK 
reset RESET
check_sec -gen
# check_sec -prove -strategy design_style -design_style_type clock_gating
# check_sec -prove
check_sec -prove -strategy proof
