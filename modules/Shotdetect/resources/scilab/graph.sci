// Extraction des donn�es
fd=mopen("resultats/grosfilm.out","r")
for i=1:10000,         
A(i)=mfscanf(fd,"%d,");
end 
// Calcul de la d�riv�e
for i=1:9999,        
B(i)=abs(A(i)-A(i+1));
end  
