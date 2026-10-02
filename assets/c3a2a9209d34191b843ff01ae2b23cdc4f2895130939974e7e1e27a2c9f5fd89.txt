# JasperGold SEC: sequential equivalence (golden vs revised RTL).
# Placeholders replaced by verification_tools.run_sec_remote:
#   avalon_memory_mapped_master.v0, avalon_memory_mapped_master.v1, avalon_memory_mapped_master, CLK, RESET
set DESIGN_NAME_GOLDEN "avalon_memory_mapped_master.v0"
set DESIGN_NAME "avalon_memory_mapped_master.v1"
set TOP_NAME "avalon_memory_mapped_master"


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
