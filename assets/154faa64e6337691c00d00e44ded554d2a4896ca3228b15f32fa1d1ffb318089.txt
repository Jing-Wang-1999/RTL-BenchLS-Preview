# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   three_channel_countdown_timer.v0, three_channel_countdown_timer.v1, three_channel_countdown_timer, clk, rst
set DESIGN_NAME_GOLDEN "three_channel_countdown_timer.v0"
set DESIGN_NAME "three_channel_countdown_timer.v1"
set TOP_NAME "three_channel_countdown_timer"


clear -all
check_sec -analyze -spec -sv ./input/rtl/${DESIGN_NAME_GOLDEN}.v
check_sec -analyze -imp -sv ./input/rtl/${DESIGN_NAME}.v
check_sec -elaborate -spec -top ${TOP_NAME} -disable_auto_bbox
check_sec -elaborate -imp -top ${TOP_NAME} -disable_auto_bbox
# check_sec -setup clock -infer reset -none
check_sec -setup 
check_sec -map -auto
clock clk 
reset rst
check_sec -gen
# check_sec -prove -strategy design_style -design_style_type clock_gating
# check_sec -prove
check_sec -prove -strategy proof
