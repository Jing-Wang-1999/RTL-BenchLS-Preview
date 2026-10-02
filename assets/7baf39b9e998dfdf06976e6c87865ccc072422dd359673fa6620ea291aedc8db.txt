module clocked_signed_magnitude_calculator(
input Clock,
input [10:0]binaryOperand1, 
input [10:0]binaryOperand2,
input [3:0]operator,
output reg [20:0]answer,
output reg sign
);
	reg [3:0]selectedOperator;
	wire [10:0]normieOperand1;
	wire [10:0]normieOperand2;
	
	assign normieOperand1 = ~binaryOperand1 + 1'b1; 
	assign normieOperand2 = ~binaryOperand2 + 1'b1;
	
	always @(posedge Clock)
		begin
			case(operator)
				4'b1101: 
					begin
						sign = (binaryOperand1[10] ^ binaryOperand2[10]); 
						
						if((binaryOperand1[10] == 0) && (binaryOperand2[10] == 0)) 
							answer <= binaryOperand1 * binaryOperand2;
						else if((binaryOperand1[10] == 1) && (binaryOperand2[10] == 0)) 
							answer <= normieOperand1 * binaryOperand2; 
						else if((binaryOperand1[10] == 0) && (binaryOperand2[10] == 1)) 
							answer <= binaryOperand1 * normieOperand2;
						else if ((binaryOperand1[10] == 1) && (binaryOperand2[10] == 1))
							answer <= (normieOperand1 * normieOperand2);
					end
				
				4'b1110: 
					begin
						answer = binaryOperand1 - binaryOperand2; 
						
						if (answer[20] == 1)
							begin
								sign = 1; 
								answer = ~answer + 1'b1; 
							end
						else
							sign = 0;
					end
				
				4'b1111: 
					begin
						answer = binaryOperand1 + binaryOperand2; 
						
						if (answer[20] == 1)
							begin
								sign = 1; 
								answer = ~answer + 1'b1; 
							end
						else
							sign = 0;
					end
					
				default: answer = answer;
			endcase
		end
		
endmodule