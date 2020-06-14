/*===========================================================================

					GENPACK
OPTIMAL NESTING OF TWO DIMENSIONAL PARTS USING GENETIC ALGORITHMS.
IRREGULAR COMPONENTS ARE ALSO TREATED IN THIS PROGRAM USING MINIMUM
ENCLOSING RECTANGLE PRINCIPLE.
    		
Copyright (C)  2001

THIS PROGRAM IS PART OF B.E. PROJECT UNDERTAKEN BY FOLLOWING STUDENTS

		YOGESH KULKARNI
  		KEDAR KHALADKAR
  		KAUSHIK MANTRI
  		AMIT LEMBHE

  VERSION 2.01

  DATE : 15 APRIL 2001

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

for more information contact us at:
 	E-MAIL:
		kedar_khaladkar@yahoo.com
		yakulkarni@yahoo.com
		lembheamit@yahoo.com
		mantrikd@yahoo.co.in 

 ===============================================================================*/
/*Header files required for program*/

#include<math.h>
#include<stdio.h>
#include<conio.h>
#include<graphics.h>
#include<stdlib.h>
#include<dos.h>
#include<string.h>
/*======================================================================*
 CONSTANT VARIABLES
 sidemax= maximum sides of ploygon;
 inmax=maximum no of items allowed;
 popsize=population size for gentic run;
 fmultiple=parameter required for roullete wheel selection;
 scale=to show scaled output, value will show the length of bin on
 output screen;
 s= tournament size
*========================================================================*/
#define sidemax 15
#define inmax 80
#define popsize 20
#define fmultiple 1.5
#define scale 350
#define s 2

/*=======================================================================
 GLOBAL DECLARTIONS
 INTEGRS
	isbest=to find bestever solution;
	q=crossover length;
	maxgen=maximum no. of generations;
	in=number of items;
	leng=length  of stock;
	*arr and *ar1 are arrays for random sequence generation
	count=pivot counter;
	Lx,Ly,ymax,xmax for output purpose;
	fla,fla1 are flags for roullete selection
	popcount=population counter;

  FLOATS
	pcross=probability of crossover;
	pmute=probability of mutation;
	xscale,y_scale=for scaling purpose;

  STRING
	fname=stores filename
===========================================================================*/
int isbest=0,q,maxgen,in,leng,*arr,*ar1,arr1[popsize],count,genc,Lx=0,Ly=0,ymax,xmax;
int fla=0,fla1=0,popcount,tot_crossovers=0,tot_mutations=0;
float pcross,pmute,x_scale,y_scale;
char fname[200];



/*=======================================================================
FILE HANDLING
 f=lisp file writing stream;
 infp=input data reading stream;
 fp=input data writing stream;
 rfp=result file writing stream;
========================================================================*/
FILE *f,*infp,*fp,*rfp;


/*=======================================================================
DESCRIPTIONS OF VARIOUS STRUCTURES USED
1. struct pivot
	Contains information about pivot
	sx,sy = co-ordinates;
	avalx,avaly= size of rectangle which could be placed at this pivot
	parent=pivots rectangle;
	isalive=flag for pivot on off;
	pfor=no. of rectangle placed at this pivot;
	which= zeroth or first pivot
	ischeckx,ischecky= flags for check in x and y direction

2. struct irr
	Contains information of vertices of an irregular shaped item
	sx,sy=co-ordinates;
	sides=number of vertices/sides of polygon

3. struct rect
	Contains information of rectangle(s)/MER(s)
	len,wid=length and width;
	rot=flag showing rotation of rectangle
	    0 - not rotated
	    1 - rotated
	flag=whether rectangle is placed or not
	no=number of irregular shaped item;
	irr=whether item is irregular or not;

4. struct pop_detail
	Detailed description of population
	chrom[inmax]=chromosome;
	packht=packing height;
	gen_no=number of current generation;
	parent1=father chormosome;
	parent2=mother chromosome;
	is_crossed=flag for crossover;
	cross_site=crossover site;
	cross_length= crossover length;

5. struct roullete
	Contains information of roullete wheel selection
	stringno=counter for chromosome
	height=decoded heights of chromosomes
	fitness=fitness of individual
	a=for invidual fitness/ sumfitness
	b=a/population size;
	c=cumulative probabilty;
	d=random no;
	choostr=chosen string number;

6. srtuct co
	Contains information of vertices of irregular shaped polygon
	sx,sx=co-ordinates;

========================================================================*/
struct pivot{
		float sx,sy,avalx,avaly;
		int parent,isalive,pfor,which,ischeckx,ischecky;
	    }*p,tempivot,chosen;


struct irr{
		float sx[sidemax],sy[sidemax];
		int sides;
	  }pos[inmax],trans[inmax],tem_pos;


struct rect{
		int rot,flag,no,irr,number;
		float len,wid;
	   }*rr,*sor,temp;


struct pop_detail{
		  int chrom[inmax];
		  float packht;
		  int gen_number;
		  int parent1;
		  int parent2;
		  int cross_site;
		  int cross_length;
		  int is_crossed;
		  float fx;
		 }oldpop[popsize],newpop[popsize],tempop[popsize],bestever,child1,child2;


struct roullete{
		  int stringno[popsize];
		  float height[popsize];
		  float a[popsize];
		  float fitness[popsize];
		  float scalfit[popsize];
		  float b[popsize];
		  float c[popsize];
		  float d[popsize];
		  int choostr[popsize];
		}generation;

struct co{
	  int flag;
	  int sx,sy;
	 }*co_ord1;


/*=======================================================================
DEFINITIONS OF VARIOUS FUNCTIONS USED

1. FUNCTIONS USED FOR GA
========================================================================*/
int input1();
void initialize();
void decode();
void best();
void selection();
void crossover();
void mutation();
void report();
void genetic();

int ifflip(float);
void seqgenr(int);
void givesign();

void roul();
void tour_select();

void crosser();

float area_occupied();

void final_op();

/*======================================================================
2. FUNCTIONS USED FOR HEURSTIC SOLUTIONS
========================================================================*/
char sort_menu();
float place_sort();
void sortlen();
void sortwid();
void sortper();
void sortarea();
int load();

/*======================================================================
3.FUNCTIONS FOR IMPLEMENTING BOTTOM LEFT FILL PLACEMENT
========================================================================*/
void inplace();
float place();
void choose_x();
int choosepivot(int);
void checkx(int);
void checky(int);
int px(int);
void ch(int,int);
void pivot_status(int,int,int);
float  height(int);

/*======================================================================
OTHER FUNCTIONS
========================================================================*/
void getbound(int,int);
void input();

/*======================================================================
PROGRAMS STARTS HERE
========================================================================

int iflip(float)
Description:Function for flipping a coin with a certain probability
Input:probabilty value
Returns: 0 if random number generates is greater than probabilty
	 1 if random number generates is less than probabilty
========================================================================*/

int ifflip(float pcr)
 {
  int r,k;
  float rr;

  r=random(1000);
  rr=r/1000.0;

  if(rr<pcr) {
	       k=1;
	     }
  else  {
	  k=0;
	}

  return k;

 }

/*======================================================================
void seqgenr(int)

Description: Sequence generator that creates random sequence of rectangles
	     without repetation. Rotattion of rectangles is considerd.
Input   :Number of items to be placed
Returns :Nothing
======================================================================*/
void seqgenr(int maxno)
 {
  int i,k,temp;

  for(i=0;i<maxno;i++) {
			ar1[i]=0;
		       }

  for(i=0;i<maxno;)    {
			k=random(maxno);
			if(ar1[k]==0) {
					 arr[i]=k;
					 ar1[k]=1;
					 givesign();
					 i++;
				       }
			}

  for(i=0;i<maxno;i++)  {
			  sor[i]=rr[abs (arr[i])];

			  if(arr[i]<0)  {
					  sor[i].rot=1;
					}

			  if(sor[i].len<sor[i].wid)  {
						      temp=sor[i].len;
						      sor[i].len=sor[i].wid;
						      sor[i].wid=temp;
						     }
			 }

  }


/*======================================================================
void seqgen(int)

Description: Sequence generator that creates random sequence of rectangles
	     without repetation. Rotation is not considered.
Input   :Number of items to be placed
Returns :Nothing
======================================================================*/
void seqgen(int maxno)
 {
  int i,k,temp;

  for(i=0;i<maxno;i++)
   ar1[i]=0;

  for(i=0;i<maxno;)  {
		       k=random(maxno);

		       if(ar1[k]==0)    {
					  arr1[i]=k;
					  ar1[k]=1;
					  i++;
					}
		     }

 }


/*======================================================================
void givesign(int)

Description: Gives sign to rectangle number which decides its rotation
Input is number of item in the array
Returns :Nothing,sign change is for global variable
======================================================================*/
void givesign(int i)
 {
  int r;

  r=ifflip(0.3);

  if(r==1) {
	    arr[i]=arr[i]*(-1);
	   }

 }

/*====================================================================
void getbound(int,int)
Description:Finds out the Minimum Enclosing Rectangle(MER) for
	    irregular shaped component using geometric transformations.

Input:Number of irregular shaped component and number of MER

Returns:Nothing,length and width are assigned for global variables
====================================================================*/
void getbound(int item_no,int it)
 {
  int i,j,k;
  int xmax,main;
  int nctrlpt=0;
  float l,m,tarea,len=0.0,wid=0.0,te,minarea=1000000.0;
  float tminx,tmaxx,tminy,tmaxy;
  float xformn[3][3];
  double theta;
  double ratio;

  fscanf(infp,"%d",&tem_pos.sides);
  nctrlpt=tem_pos.sides;

  for(i=0;i<nctrlpt;i++){
			 fscanf(infp,"%f  %f",&tem_pos.sx[i],&tem_pos.sy[i]);
			}

  for(main=0;main<nctrlpt-1;main++)
   {
     tminx=tem_pos.sx[main];
     tmaxx=tem_pos.sx[main];
     tminy=tem_pos.sy[main];
     tmaxy=tem_pos.sy[main];

     for(k=main+1;k<=nctrlpt-1;k++)
      {
	   l=tem_pos.sx[main];
	   m=tem_pos.sy[main];

	   if(((float)tem_pos.sx[k]-(float)tem_pos.sx[main])!=0)
		{
		  ratio =((float)tem_pos.sy[k]-(float)tem_pos.sy[main])/(float)((float)tem_pos.sx[k]-(float)tem_pos.sx[main]);
		  theta=atan(ratio);
		}

	    else
		{
		   theta=M_PI/2;
		}

	    xformn[0][0]=cos(theta);
	    xformn[0][1]=-sin(theta);
	    xformn[0][2]=0;
	    xformn[1][0]=sin(theta);
	    xformn[1][1]=cos(theta);
	    xformn[1][2]=0;
	    xformn[2][0]=-l*cos(theta)-m*sin(theta);
	    xformn[2][1]=l*sin(theta)-m*cos(theta);
	    xformn[2][2]=1;

	    for(i=0;i<nctrlpt;i++)
		{
		  trans[item_no].sx[i]=tem_pos.sx[i]*xformn[0][0]+tem_pos.sy[i]*xformn[1][0]+xformn[2][0];

		  if(trans[item_no].sx[i]<tminx) tminx=trans[item_no].sx[i];

		  if(trans[item_no].sx[i]>tmaxx) tmaxx=trans[item_no].sx[i];

		  trans[item_no].sy[i]=tem_pos.sx[i]*xformn[0][1]+tem_pos.sy[i]*xformn[1][1]+xformn[2][1];

		  if(trans[item_no].sy[i]<tminy) tminy=trans[item_no].sy[i];

		  if(trans[item_no].sy[i]>tmaxy) tmaxy=trans[item_no].sy[i];
		}

	     tarea = ((float)tmaxx-(float)tminx)*((float)tmaxy-(float)tminy);

	     if(tarea<minarea)
		  {
		     minarea=tarea;

		     for(i=0;i<nctrlpt;i++)
		       {
			 pos[item_no].sx[i]=trans[item_no].sx[i]-tminx;
			 pos[item_no].sy[i]=trans[item_no].sy[i]-tminy;
			}

		     len=fabs(tmaxx-tminx);
		     wid=fabs(tmaxy-tminy);
		   }

	}

      }

  if(len<wid)
	{
	   te=len;
	   len=wid;
	   wid=te;

	   for(i=0;i<nctrlpt;i++)
	      {
		te=pos[item_no].sy[i];
		pos[item_no].sy[i]=pos[item_no].sx[i];
		pos[item_no].sx[i]=len-te;
	      }
	 }

  pos[item_no].sides=nctrlpt;
  rr[it].len=len;
  rr[it].wid=wid;

 }

/*====================================================================
void input1()
Description: Reads the input file for genetic run.Also takes values of
	     probabilty of crossover and mutation from user.

Input:Input data file

Returns:A flag if input dat file is not valid.
	Assigns values to global variables
====================================================================*/
int input1()
{
  int i,choice,no_sides,item_no=0,v_flag;
  char a[200];
  char str[120];
  char b[200];
  char *valid="GENPACK2";
  char valid1[10];

  sprintf(str,"Enter name of input data file:");
  outtextxy(20,260,str);
  gotoxy(35,17);
  scanf("%s",&a);

  infp=fopen(a,"r");

  fscanf(infp,"%s",&valid1);

  v_flag=strcmp(valid,valid1);
  if(v_flag!=0)
   {
    fclose(infp);
    outtextxy(20,270,"Invalid Input File Format");
    printf("\a");
    getch();
   }
  else
   {
    sprintf(str,"Enter name of result file:");
    outtextxy(20,275,str);
    gotoxy(35,18);
    scanf("%s",&b);

    rfp=fopen(b,"w");

    fscanf(infp,"%d",&in);

    fprintf(rfp,"Input file: %s\n",a);
    fprintf(rfp,"\nNo. of Items=%d\n",in);

    /*memory allocation*/
    rr=(struct rect*)malloc(in*sizeof(struct rect));
    sor=(struct rect*)malloc(in*sizeof(struct rect));
    arr=(int *)malloc(in*sizeof(int));
    ar1=(int *)malloc(in*sizeof(int));

    fscanf(infp,"%d",&leng);
    fprintf(rfp,"\nSize of base rectangle=%d\n",leng);

    /*memory allocation for pivots*/
    p=(struct pivot*)malloc((2*in+2*leng)*(sizeof(struct pivot)));

    for(i=0;i<in;i++) {
		      fscanf(infp,"%d",&choice);

		      switch(choice) {

			 case 1:
				  getbound(item_no,i);
				  fprintf(rfp,"\n%d\t%f\t%f",i+1,rr[i].len,rr[i].wid);
				  rr[i].no=item_no;
				  item_no++;
				  rr[i].flag=0;
				  rr[i].rot=0;
				  rr[i].irr=1;
				  rr[i].number=i;
				  break;

			 case 2:
				  fscanf(infp,"%f",&rr[i].len);
				  fscanf(infp,"%f",&rr[i].wid);
				  fprintf(rfp,"\n%d\t%f\t%f",i+1,rr[i].len,rr[i].wid);
				  rr[i].flag=0;
				  rr[i].rot=0;
				  rr[i].irr=0;
				  rr[i].number=i;
				  break;

					}

		      }

   fclose(infp);

   sprintf(str,"Enter name of lisp file:");
   outtextxy(20,292,str);
   gotoxy(35,19);
   scanf("%s",&fname);

   sprintf(str,"Enter probability of crossover:(0-1)=");
   outtextxy(20,308,str);
   gotoxy(42,20);
   scanf("%f",&pcross);
   fprintf(rfp,"\nProbability of crossover=%f",pcross);

   sprintf(str,"Enter probability of mutation:(0-1)=");
   outtextxy(20,324,str);
   gotoxy(42,21);
   scanf("%f",&pmute);
   fprintf(rfp,"\nProbability of mutation=%f",pmute);

   sprintf(str,"Enter maximum generations to be considered:");
   outtextxy(20,340,str);
   gotoxy(47,22);
   scanf("%d",&maxgen);
   fprintf(rfp,"\nGenerations=%d",maxgen);

   fprintf(rfp,"\n==========================================================================\n");
   setcolor(YELLOW);
   outtextxy(20,360,"Processing data : wait");
  }

 return v_flag;
}
/*====================================================================
void initialize()
Description:Creates initial population with first 4 members obtained
	    by heuristic solutions.
====================================================================*/
void initialize()
{
  int i,j;

  for(i=0;i<popsize;i++) {

			   switch(i) {

					case 0:
						sortlen();

						for(j=0;j<in;j++)
						 {
						  oldpop[i].chrom[j]=arr[j];
						 }

						break;

					case 1:
						sortwid();

						for(j=0;j<in;j++)
						 {
						   oldpop[i].chrom[j]=arr[j];
						 }

						break;

					case 2:
						sortper();

						for(j=0;j<in;j++)
						 {
						   oldpop[i].chrom[j]=arr[j];
						 }

						break;

					case 3:
						sortarea();

						for(j=0;j<in;j++)
						 {
						   oldpop[i].chrom[j]=arr[j];
						 }

						break;

					default:
						seqgenr(in);

						for(j=0;j<in;j++)
						 {
						  oldpop[i].chrom[j]=arr[j];
						 }
						break;

				   }

			    oldpop[i].packht=0.0;
			    oldpop[i].parent1=0;
			    oldpop[i].parent1=0;
			    oldpop[i].cross_site=0;
			    oldpop[i].cross_length=0;
			    oldpop[i].gen_number=0;
			    oldpop[i].is_crossed=0;
			    oldpop[i].fx=0.0;

			   }

 }

/*====================================================================
void decode()
Description:Decodes the chromosome to find packing height for every
	    member of population.
====================================================================*/
void decode()
 {
   int i;

   for(i=0;i<popsize;i++) {
			    oldpop[i].packht=0.0;
			    oldpop[i].packht=height(i);
			  }

 }

/*====================================================================
void best()
Description:Finds best ever solution and stores it. Packing height
	    is the only criteria for finding bestever.
====================================================================*/
void best()
 {
  int i,j;

  if(genc==0)  {
		bestever=oldpop[0];
	       }

  for(i=0;i<popsize;i++)  {
			   if(bestever.packht>oldpop[i].packht)
			    bestever=oldpop[i];
			  }
 }

/*====================================================================
void selection()
Description:Selection operator.
	    Either keep roulette wheel selection [roul()]
	    OR
	    tournament selection[tour_select()]

====================================================================*/
void selection()
 {

  roul();

  /*tour_select();*/
 }

/*====================================================================
void crossover()
Description:Selects chromosome for crossover. Crosses them with
	    certain probabilty using function crosser().

====================================================================*/
void crossover()
 {
  int i,j=0,mate1,mate2,jcross;

   randomize();

   for(i=0;i<popsize;i++) {
			   tempop[i]=newpop[i];
			  }

   for(i=0;i<popsize;)   {

			    mate1=i;
			    i++;
			    mate2=i;
			    i++;

			    if(ifflip(pcross))
			     {
			      crosser(mate1,mate2);
			      tot_crossovers++;
			      newpop[j]=child1;
			      newpop[j].packht=0;
			      newpop[j].parent1=mate1;
			      newpop[j].parent2=mate2;
			      newpop[j].cross_site=jcross;
			      newpop[j].cross_length=q;
			      newpop[j].gen_number=genc;
			      newpop[j].is_crossed=1;
			      newpop[j].fx=0;
			      j++;
			      newpop[j]=child2;
			      newpop[j].packht=0;
			      newpop[j].parent1=mate1;
			      newpop[j].parent2=mate2;
			      newpop[j].cross_site=jcross;
			      newpop[j].cross_length=q;
			      newpop[j].gen_number=genc;
			      newpop[j].is_crossed=1;
			      newpop[j].fx=0;
			      j++;
			     }
			    else
			     {
			      newpop[j]=tempop[mate1];
			      j++;
			      newpop[j]=tempop[mate2];
			      j++;
			     }

			}

 }

/*====================================================================
void mutation()
Description:Mutation operator. Changes sign of array element randomly
	    with given probability. Sign decides rotation of rectangle.

====================================================================*/
void mutation()
 {
  int i,j;
  for(i=0;i<popsize;i++)  {
			   for(j=0;j<in;j++)
			      {
				if(ifflip(pmute))
				 {
				  newpop[i].chrom[j]=-newpop[i].chrom[j];
				  tot_mutations++;
				 }
			       }
			   }

 }

/*====================================================================
void crosser(int,int)
Description:Forms child chromosomes in crossover.

Input: Number of parent chromosomes.

Returns:Nothing, but crates child chormosomes which are globally
	declared.
====================================================================*/
void crosser(int mate1,int mate2)
{
  int i,j,l,p,k,t,qlim,jcross;

  randomize();

  /*for two point crossover "p=random(in);" and for single point
  crossover p=0;*/
  p=0;

  p=p+1;
  qlim=in+1-p;
  q=random(qlim);   /*q is the crossover site */
  q=q+1;

  t=q;

  for(i=0;i<q;i++)  {
		     child1.chrom[i]=tempop[mate1].chrom[p+i-1];
		    }

  for(j=0;j<in;j++) {

		     for(i=0,l=0;i<q;i++)
		      {
		       if(abs(tempop[mate2].chrom[j])!=abs(child1.chrom[i]))
			{
			 l++;
			}

		       if(l==q)
			{
			 child1.chrom[q]=tempop[mate2].chrom[j];
			 q++;
			}

		      }

		     }

   q=t;

   for(i=0;i<q;i++)    {
			child2.chrom[i]=tempop[mate2].chrom[p+i-1];
		       }

   for(j=0;j<in;j++)   {

			 for(i=0,l=0;i<q;i++)
			  {
			   if(abs(tempop[mate1].chrom[j])!=abs(child2.chrom[i]))
			    {
			     l++;
			    }

			   if(l==q)
			    {
			     child2.chrom[q]=tempop[mate1].chrom[j];
			     q++;
			    }

			  }

			}

 }

/*====================================================================
void roul()
Description:Roullete wheel selection with scaling.
	    Generates generation report.
	    Concept from Goldberg(pg.79)
====================================================================*/
void roul()
 {
   int i,j,m;
   float sumfit=0,k,avgfit=0,l;
   float cona=0,conb=0,umax=0,umin=1000,delta=0;

   randomize();

   for(i=0;i<popsize;i++)
    {
     generation.stringno[i]=i;
     generation.height[i]=oldpop[i].packht;
     generation.fitness[i]=1.0/(oldpop[i].packht);

     if(generation.fitness[i]>umax) umax=generation.fitness[i];
     if(generation.fitness[i]<umin) umin=generation.fitness[i];

     sumfit=sumfit+generation.fitness[i];
    }

    avgfit=sumfit/popsize;
    sumfit=0;

    if(umin>(fmultiple*avgfit-umax)/(fmultiple-1.0))
     {
      delta=umax-avgfit;
      cona=(fmultiple-1.0)*avgfit/delta;
      conb=avgfit*(umax-fmultiple*avgfit)/delta;
     }

    else
     {
      delta=avgfit-umin;
      cona=avgfit/delta;
      conb=-umin*avgfit/delta;
     }

    for(i=0;i<popsize;i++)
     {
      generation.scalfit[i]=(cona*generation.fitness[i])+conb;
      sumfit=sumfit+generation.scalfit[i];
      oldpop[i].fx=generation.scalfit[i];
     }

    avgfit=sumfit/popsize;

    for(i=0;i<popsize;i++)
     {
      if(i==0)
       {
	generation.c[0]=0;
       }

      generation.a[i]=generation.scalfit[i]/avgfit;
      generation.b[i]=generation.a[i]/popsize;
      generation.c[i]=generation.c[i-1]+generation.b[i];
      k=random(10000);
      generation.d[i]=k/10000;
     }

    for(j=0;j<popsize;j++)
     {
      fla=0,fla1=0;
      l=generation.d[j];

      for(m=0;m<popsize;m++)
       {
	if((l>0)&&(l<generation.c[0]))
	 {
	  generation.choostr[j]=0;
	  fla1=1;
	  break;
	 }

	if((l>generation.c[m])&&(l<generation.c[m+1]))
	 {
	  if(fla1==1) break;

	  generation.choostr[j]=m+1;
	  fla=1;
	  break;
	 }

	if(fla==1) break;

       }

     }

  /*generation report*/
  fprintf(rfp,"\nPopulation Report---->generation %d",genc+1);
  fprintf(rfp,"\nNo  Height    Fitness       A        B         C        D   Chosen\n");

  for(i=0;i<popsize;i++)
   {
     fprintf(rfp,"%d  ",i+1);
     fprintf(rfp,"%f  ",generation.height[i]);
     fprintf(rfp,"%f  ",generation.scalfit[i]);
     fprintf(rfp,"%f  ",generation.a[i]);
     fprintf(rfp,"%f  ",generation.b[i]);
     fprintf(rfp,"%f  ",generation.c[i]);
     fprintf(rfp,"%f  ",generation.d[i]);
     fprintf(rfp,"%d  ",generation.choostr[i]+1);
     fprintf(rfp,"\n");
     newpop[i]=oldpop[generation.choostr[i]];

   }

  fprintf(rfp,"\nBest packing height upto this generation=%f",bestever.packht);
  fprintf(rfp,"\n Total crossovers = %d  and Total Mutations=%d",tot_crossovers,tot_mutations);
  fprintf(rfp,"  Average fitness=%f",avgfit);

  fprintf(rfp,"\n===========================================================================\n");

 }

/*====================================================================
void tour_select()
Description:Tournament selection.
	    Generates generation report.
====================================================================*/
void tour_select()  /*TOURNAMENT SELECTION*/
 {
   int i,j,k;
   int tourpos[s];
   int no,chosen,count=0;
   float sumfit=0,avgfit=0;

   for(i=0;i<popsize;i++)
     {
	generation.stringno[i]=i;
	generation.height[i]=oldpop[i].packht;
	generation.fitness[i]=1.0/(oldpop[i].packht);

	sumfit=sumfit+generation.fitness[i];
     }

   avgfit=sumfit/popsize;
   sumfit=0;

   for(i=0;i<popsize/s;i++)
     {
	seqgen(popsize);

	for(j=0;j<s;j++)
	  {
	    no=j*s;

	    for(k=j*s;k<(j+1)*s;k++)
	      {
		if(generation.height[arr1[k]]<=generation.height[arr1[no]])
		  generation.choostr[count]=arr1[k];
	      }

	    count++;
	  }
     }

 /*Generation Report*/
   fprintf(rfp,"\n\n\nPopulation Report---->generation %d",genc+1);
   fprintf(rfp,"\nNo  Height    Fitness       Chosen\n");

   for(i=0;i<popsize;i++)
     {
       fprintf(rfp,"%d   ",i+1);
       fprintf(rfp,"%f   ",generation.height[i]);
       fprintf(rfp,"%f   ",generation.fitness[i]);
       fprintf(rfp,"%d   ",generation.choostr[i]+1);
       fprintf(rfp,"\n");
       newpop[i]=oldpop[generation.choostr[i]];

     }

   fprintf(rfp,"\nBest packing height upto this generation=%f",bestever.packht);
   fprintf(rfp,"\n Total crossovers = %d  and Total Mutations=%d",tot_crossovers,tot_mutations);
   fprintf(rfp,"  Average fitness=%f",avgfit);

   fprintf(rfp,"\n===========================================================================\n");

}

/*====================================================================
void final_op()
Description:Shows result of genetic run on the console with scaling.
	    Also writes a Lisp file.
====================================================================*/
void final_op()
{
  int i,i_count,n=0;
  float temp,height1,te;
  char str[200];
  char lsp[120];

  isbest=1;
  Lx=(getmaxx()/2)-leng/2;
  Ly=(getmaxy()/2)-leng/2;

  cleardevice();

  for(i=0;i<in;i++)
   {
     sor[i]=rr[abs(bestever.chrom[i])];

     if(bestever.chrom[i]<0)
      {
       sor[i].rot=1;
      }

     if(sor[i].len<sor[i].wid)
      {
       temp=sor[i].len;
       sor[i].len=sor[i].wid;
       sor[i].wid=temp;

       if(sor[i].irr==1)
	{
	 n=sor[i].no;

	 for(i_count=0;i_count<pos[n].sides;i_count++)
	  {
	    te=pos[n].sy[i_count];
	    pos[n].sy[i_count]=sor[i].len-pos[n].sx[i_count];
	    pos[n].sx[i_count]=te;
	  }

	 }

       }

    }

   inplace();

   height1=place_sort();

   sprintf(str," Packing height = %.1f",height1);
   outtextxy(400,20,str);
   setcolor(WHITE);

   getch();

   cleardevice();

 }

/*====================================================================
float area_occupied()
Description:Finds area of placed rectangles.

Returns:Area occupied by placed rectangles.
====================================================================*/
float area_occupied()
 {
  int i;
  float sum=0;

  for(i=0;i<in;i++) {
		     sum=sum+(rr[i].len*rr[i].wid);
		    }

  return sum;

 }

/*====================================================================
void genetic()
Description:Genetic run. Calls various functions to carry out genetic
	    run.Gives optimal solution.
====================================================================*/
void genetic()
 {
  int i,v_flag;
  char chk[80],cho;
  char str[200];
  float area,waste,ut;

  genc=0;

  v_flag=input1();

  if(v_flag==0)

  {
   initialize();

  /*generations begin*/
   for(genc=0;genc<maxgen;genc++)
    {
     setcolor(YELLOW);
     sprintf(str,"%.0f percent complete",((float)genc/maxgen)*100.0);
     outtextxy(400,360,str);

     /*to get packing height and fitness function*/
      decode();

     /*finds the bestever solution*/
      best();

     /*Selection/reproduction operator */
      selection();

      /*crossover on the chromosomes with a certain probability*/
      crossover();

      /*mutation operator - changing rotation with certain probability*/
      mutation();

      for(i=0;i<popsize;i++) /*copies new population  to old population*/
       {
	oldpop[i]=newpop[i];
	oldpop[i].is_crossed=0;
	generation.stringno[i]=0;
	generation.height[i]=0;
	generation.a[i]=0;
	generation.b[i]=0;
	generation.c[i]=0;
	generation.d[i]=0;
	generation.fitness[i]=0;
	generation.choostr[i]=0;
       }

     setcolor(LIGHTBLUE);
     sprintf(str,"%.0f percent complete",((float)genc/maxgen)*100.0);
     outtextxy(400,360,str);

    }

   fprintf(rfp,"\nPacking height = %f",bestever.packht);

   area=waste=0.0;
   area=(float)bestever.packht*leng;
   waste=(float)(area-area_occupied());

   fprintf(rfp,"\n\nArea wasted= %.4f",waste);
   fprintf(rfp,"\n\n Area wasted= %f \%",((float)waste/area)*100.0);

   ut=(float)area_occupied()/area;
   fprintf(rfp,"\n\n Utilization Factor= %f",ut);

   fclose(rfp);

   setcolor(LIGHTBLUE);
   outtextxy(20,360,"Processing data : wait");
   setcolor(YELLOW);
   outtextxy(20,360,"Processing data complete: Press any key to continue");

   getch();

   outtextxy(20,370,"Do you want to see output(y/n)?");
   gotoxy(40,24);

   cho=getch();
   if(cho=='y'||cho=='Y')
    {
     final_op();
    }
  }
 }


/*BOTTOMLEFT-FILL ALGORITHM BEGINS HERE*/
/*====================================================================
void inplace()
Description:Makes left side of base rectangle with all points as pivots

====================================================================*/
void inplace()
 {
  int i;

  count=0;   /*count contains no. of pivots available*/

  for(i=0;i<(2*leng);i++)  {
			    p[i].avalx=leng;
			    p[i].avaly=(2*leng)-i;
			    p[i].sx=Lx;
			    p[i].sy=Ly+i;
			    p[i].isalive=0;
			    p[i].ischeckx=0;
			    p[i].ischecky=0;
			    p[i].which=2;

			    count++;

			   }

 }

/*====================================================================
void choose_x()
Description:Supplimentory function to choosepivot to get bottomleft pivot
	    if two pivots with same 'y' position then choses left one.
====================================================================*/
void choose_x()
 {
  int k,j;

  for(k=0;k<count;k++)
   {

    for(j=0;j<count;j++)
     {

      if ((p[j].sy==p[j+1].sy)&&(p[j].sx>p[j+1].sx))
       {
	tempivot=p[j];
	p[j]=p[j+1];
	p[j+1]=tempivot;
       }

      }

    }

 }

/*====================================================================
int choosepivot(int)
Description:Choses the pivot for placement.

Input:Number of input rectangle.

Returns:Number of chosen pivot.
====================================================================*/
int choosepivot(int z)
 {
   int k,l,xx,i,j;

   for(i=0;i<count;i++)
    {

      for(j=i+1;j<count;j++)
       {

	 if(p[i].sy>p[j].sy)
	  {
		tempivot=p[i];
		p[i]=p[j];
		p[j]=tempivot;
	  }

	}
     }

    choose_x();

    for(i=0;i<count;i++)
     {

      if((p[i].avaly>=sor[z].wid)&&(p[i].avalx>=sor[z].len)&&(p[i].isalive==0))
       {
	 chosen=p[i];
	 k=i;
	 break;
	}

       else
	{
	 k=-1;
	}

      }

  return k;

 }

/*====================================================================
void checkx(int)
Description:For a pivot checks the gap in 'X' Direction.

Input:Number of placed rectangle.
====================================================================*/
void checkx(int ww)
 {
  int l;

  for(l=0;l<=count;l++)
   {

     if(((p[count].sy)>p[l].sy)&&(p[count].sx>p[l].sx)&&(p[l].ischeckx==0))
      {
       p[l].avalx=p[count].sx-p[l].sx;
       p[l].ischeckx=1;
      }

     if(((p[count].sy)>p[l].sy)&&(p[count].sx==p[l].sx)&&(p[l].ischeckx==0))
      {
       p[l].isalive=1;
       p[l].ischeckx=1;
      }

    }

   for(l=0;l<count;l++)
    {

     if(((chosen.sy+sor[ww].wid)>p[l].sy)&&(p[l].ischeckx==1)&&(chosen.sx>p[l].sx)&&(chosen.sx<p[l].sx+p[l].avalx))
      {
       p[l].avalx=chosen.sx-p[l].sx;
      }

     if(((chosen.sy+sor[ww].wid)>p[l].sy)&&(p[l].ischeckx==1)&&(chosen.sx==p[l].sx)&&(chosen.sx<p[l].sx+p[l].avalx))
      {
       p[l].isalive=1;
      }

    }

}

/*====================================================================
void checky(int)
Description:For a pivot checks the gap in 'Y' Direction.

Input:Number of placed rectangle.
====================================================================*/
void checky(int ww)
 {
  int l;

  for(l=0;l<count;l++)
   {

    if((p[count].sy>=p[l].sy)&&(p[count].sx>p[l].sx)&&(p[l].ischecky==0))
     {
      if((p[l].sx>=(p[count].sx-sor[p[count].parent].len))&&(p[count].sy>p[l].sy))
       {
	p[l].avaly=p[l].avaly-chosen.avaly;
	p[l].ischecky=1;
       }

      if((p[l].sy==p[count].sy)&&(p[count].sx>p[l].sx)&&(p[l].ischecky==0))
       {
	if(p[l].sx>=(p[count].sx-sor[p[count].parent].len))
	 {
	  p[l].isalive=1;
	 }
       }

      }
    }

  for(l=0;l<count;l++)
   {
     if(((chosen.sx+sor[ww].len)>=p[l].sx)&&(chosen.sy>p[l].sy)&&(p[l].ischecky==1)&&(chosen.sy<p[l].sy+p[l].avaly))
      if(p[l].sx>=(p[count].sx-sor[p[count].parent].len))
       {
	p[l].avaly=chosen.sy-p[l].sy;
       }

     if(((chosen.sx+sor[ww].len)>=p[l].sx)&&(chosen.sy==p[l].sy)&&(p[l].ischecky==1)&&(chosen.sy<p[l].sy+p[l].avaly))
      if(p[l].sx>=(p[count].sx-sor[p[count].parent].len))
       {
	p[l].isalive=1;
       }
    }
 }

/*====================================================================
int px(int)
Description:Verifies special pivot condition.
Input: Pivot position
Returns:Length of adjacent rectangle.
====================================================================*/
int px(int p_pos)
 {
  int l;

  for(l=0;l<p_pos;l++)
   {

    if((p[l].parent==p[p_pos].parent)&&(p[l].which==0)&&(p[l].isalive==1))

     break;
   }

  return l;

 }
/*====================================================================
void ch(int,int)
Description: This is special pivot defined.

Input:Pivot number, rectangle number.

====================================================================*/
void ch(int p_pos,int re_pos)
 {
  int l;

  l=px(p_pos);

  if(sor[p[p_pos].parent].wid==sor[p[l].pfor].wid)
   {
    p[count].sx=p[p_pos].sx+sor[re_pos].len;
    p[count].sy=p[p_pos].sy;
    p[count].avalx=p[p_pos].avalx-sor[re_pos].len;
    p[count].avaly=p[p_pos].avaly;
    p[count].isalive=0;
    p[count].which=0;
    p[count].parent=re_pos;

    if(p[p_pos].ischeckx==1)
     p[count].ischeckx=1;
    else
     p[count].ischeckx=0;

    if(p[p_pos].ischecky==1)
     p[count].ischecky=1;
    else
     p[count].ischecky=0;

    count++;

   }

 }

/*====================================================================
void pivot_status(int,int,int)
Description:Changes pivot parameters after one rectangle get placed

Input:Type of pivot, pivot postion for last placed rectangle,number of
      last placed rectangle.

====================================================================*/
void pivot_status(int pflag,int p_pos,int re_pos)
 {

  int i;

  switch(pflag)
     {
      case 0:
	     p[count].sx=p[p_pos].sx+sor[re_pos].len;
	     p[count].sy=p[p_pos].sy;
	     p[count].parent=re_pos;
	     p[count].isalive=0;
	     p[count].avalx=p[p_pos].avalx-sor[re_pos].len;
	     p[count].avaly=p[p_pos].avaly;
	     p[count].which=0;

	     if(p[p_pos].ischeckx==1)
	       p[count].ischeckx=1;
	     else
	       p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	       p[count].ischecky=1;
	     else
	       p[count].ischecky=0;

	     checky(re_pos);

	     count++;

	     p[count].sx=p[p_pos].sx;
	     p[count].sy=p[p_pos].sy+sor[re_pos].wid;
	     p[count].parent=re_pos;
	     p[count].avalx=p[p_pos].avalx;
	     p[count].avaly=p[p_pos].avaly-sor[re_pos].wid;
	     p[count].isalive=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     p[count].which=1;

	     count++;

	     break;

      case 1:
	     p[count].sx=p[p_pos].sx+sor[re_pos].len;
	     p[count].sy=p[p_pos].sy;
	     p[count].parent=re_pos;
	     p[count].isalive=0;
	     p[count].avalx=p[p_pos].avalx-sor[re_pos].len;
	     p[count].avaly=p[p_pos].avaly;
	     p[count].which=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checky(re_pos);

	     count++;

	     break;

      case 2:
	     p[count].sx=p[p_pos].sx+sor[re_pos].len;
	     p[count].sy=p[p_pos].sy;
	     p[count].parent=re_pos;
	     p[count].isalive=0;
	     p[count].avalx=p[p_pos].avalx-sor[re_pos].len;
	     p[count].avaly=p[p_pos].avaly;
	     p[count].which=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checky(re_pos);

	     count++;

	     p[count].sx=p[p_pos].sx;
	     p[count].sy=p[p_pos].sy+sor[re_pos].wid;
	     p[count].parent=re_pos;
	     p[count].avalx=p[p_pos].avalx;
	     p[count].avaly=p[p_pos].avaly-sor[re_pos].wid;
	     p[count].isalive=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     p[count].which=1;

	     checkx(re_pos);

	     count++;

	     break;

      case 3:
	     p[count].sx=p[p_pos].sx+sor[re_pos].len;
	     p[count].sy=p[p_pos].sy;
	     p[count].parent=re_pos;
	     p[count].isalive=0;
	     p[count].avalx=p[p_pos].avalx-sor[re_pos].len;;
	     p[count].avaly=p[p_pos].avaly;
	     p[count].which=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checky(re_pos);

	     count++;

	     p[count].sx=p[p_pos].sx;
	     p[count].sy=p[p_pos].sy+sor[re_pos].wid;
	     p[count].parent=re_pos;
	     p[count].avalx=p[p_pos].avalx;
	     p[count].avaly=p[p_pos].avaly-sor[re_pos].wid;
	     p[count].isalive=0;
	     p[count].which=1;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checkx(re_pos);

	     count++;

	     break;

      case 4:
	     p[count].sx=p[p_pos].sx;
	     p[count].sy=p[p_pos].sy+sor[re_pos].wid;
	     p[count].parent=re_pos;
	     p[count].avalx=p[p_pos].avalx;
	     p[count].avaly=p[p_pos].avaly-sor[re_pos].wid;
	     p[count].isalive=0;
	     p[count].which=1;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checkx(re_pos);

	     count++;

	     ch(p_pos,re_pos);

	     break;

      case 5:
	     for(i=0;i<count;i++)
	      {
	       if((p[i].which==2)&&(p[i].sy<=p[p_pos].sy+sor[re_pos].wid)&&(p[i].sy>p[p_pos].sy))
		p[i].isalive=1;
	      }

	     p[count].sx=p[p_pos].sx+sor[re_pos].len;
	     p[count].sy=p[p_pos].sy;
	     p[count].parent=re_pos;
	     p[count].isalive=0;
	     p[count].avalx=p[p_pos].avalx-sor[re_pos].len;;
	     p[count].avaly=p[p_pos].avaly;
	     p[count].which=0;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checky(re_pos);

	     count++;

	     p[count].sx=p[p_pos].sx;
	     p[count].sy=p[p_pos].sy+sor[re_pos].wid;
	     p[count].parent=re_pos;
	     p[count].avalx=p[p_pos].avalx;
	     p[count].avaly=p[p_pos].avaly-sor[re_pos].wid;
	     p[count].isalive=0;
	     p[count].which=2;

	     if(p[p_pos].ischeckx==1)
	      p[count].ischeckx=1;
	     else
	      p[count].ischeckx=0;

	     if(p[p_pos].ischecky==1)
	      p[count].ischecky=1;
	     else
	      p[count].ischecky=0;

	     checkx(re_pos);

	     count++;

	     break;

     }

 }

/*====================================================================
float place()
Description:Placement of rectangles.finds the packing height.
Returns:Packing height.
====================================================================*/
float place()
 {
  int k=0,is,pflag;
  float ht=0.0,t;
  char str[30];

  for(is=0;((is<in)&&(sor[is].flag==0));is++)
   {
     if(sor[is].rot==1)
       {
	t=sor[is].len;
	sor[is].len=sor[is].wid;
	sor[is].wid=t;
       }

     if(k==-1)
      {
	is--;
	break;
      }

      k=choosepivot(is);
      p[k].isalive=1;

      if(ht<(chosen.sy+sor[is].wid-Ly))
	 ht=chosen.sy+sor[is].wid-Ly;

      p[k].pfor=is;

      if(p[k].which==0)
	{
	 if(sor[p[k].parent].wid>sor[is].wid)
	   pflag=0;

	 if(sor[p[k].parent].wid==sor[is].wid)
	   pflag=1;

	 if(sor[p[k].parent].wid<sor[is].wid)
	   pflag=2;
	}

      if(p[k].which==1)
	{
	 if((sor[p[k].parent].len>sor[is].len)||(sor[p[k].parent].len<sor[is].len))
	   pflag=3;

	 if(sor[p[k].parent].len==sor[is].len)
	   pflag=4;
	}

      if(p[k].which==2)
	{
	 pflag=5;
	}

      pivot_status(pflag,k,is);

      sor[is].flag=1;

   }

  return ht;

 }

/*====================================================================
float height(int)
Description:Calls BLF to find packing height.

Input:Chromosome number.

Returns:Packing height.
====================================================================*/
float height(int i)
 {
  int j;
  float ht,temp;

  for(j=0;j<in;j++)
   {
     sor[j]=rr[abs(oldpop[i].chrom[j])];

     if(oldpop[i].chrom[j]<0)
      {
       sor[j].rot=1;
      }

     if(sor[j].len<sor[j].wid)
      {
       temp=sor[j].len;
       sor[j].len=sor[j].wid;
       sor[j].wid=temp;
      }
    }

  inplace();

  ht=place();

  return ht;

 }


/*====================================================================
void sortwid()
Description:Sorts rectangles by width.
====================================================================*/
void sortwid()
 {
  int i,j;
  float tem;

  for(i=0;i<in;i++)  {
			sor[i]=rr[i];
			arr[i]=i;

			if(sor[i].len<sor[i].wid)
			 {
			    tem=sor[i].len;
			    sor[i].len=sor[i].wid;
			    sor[i].wid=tem;
			 }

		     }

   for(i=0;i<in;i++)  {
			 for(j=i+1;j<in;j++)
			  {

			   if(sor[i].wid<sor[j].wid)
			    {
			      temp=sor[i];
			      sor[i]=sor[j];
			      sor[j]=temp;
			      tem=arr[i];
			      arr[i]=arr[j];
			      arr[j]=tem;
			    }

			  }

		       }
 }

/*====================================================================
void sortlen()
Description:Sorts rectangles by length.
====================================================================*/
void sortlen()
 {
  int i,j;
  float tem;

  for(i=0;i<in;i++)  {
			sor[i]=rr[i];
			arr[i]=i;

			if(sor[i].len<sor[i].wid)
			 {
			    tem=sor[i].len;
			    sor[i].len=sor[i].wid;
			    sor[i].wid=tem;
			 }

		     }

   for(i=0;i<in;i++)  {
			 for(j=i+1;j<in;j++)
			  {

			   if(sor[i].len<sor[j].len)
			    {
			      temp=sor[i];
			      sor[i]=sor[j];
			      sor[j]=temp;
			      tem=arr[i];
			      arr[i]=arr[j];
			      arr[j]=tem;
			    }

			  }

		       }
 }
/*====================================================================
void sortarea()
Description:Sorts rectangles by area.
====================================================================*/
void sortarea()
 {
  int i,j;
  float tem;

  for(i=0;i<in;i++)  {
			sor[i]=rr[i];
			arr[i]=i;

			if(sor[i].len<sor[i].wid)
			 {
			    tem=sor[i].len;
			    sor[i].len=sor[i].wid;
			    sor[i].wid=tem;
			 }

		     }

   for(i=0;i<in;i++)  {
			 for(j=i+1;j<in;j++)
			  {

			   if(sor[i].wid*sor[i].len<sor[j].wid*sor[j].len)
			    {
			      temp=sor[i];
			      sor[i]=sor[j];
			      sor[j]=temp;
			      tem=arr[i];
			      arr[i]=arr[j];
			      arr[j]=tem;
			    }

			  }

		       }
 }
/*====================================================================
void sortper()
Description:Sorts rectangles by perimeter.
====================================================================*/
void sortper()
 {
  int i,j;
  float tem;

  for(i=0;i<in;i++)  {
			sor[i]=rr[i];
			arr[i]=i;

			if(sor[i].len<sor[i].wid)
			 {
			    tem=sor[i].len;
			    sor[i].len=sor[i].wid;
			    sor[i].wid=tem;
			 }

		     }

   for(i=0;i<in;i++)  {
			 for(j=i+1;j<in;j++)
			  {

			   if(sor[i].len+sor[i].wid<sor[j].len+sor[j].wid)
			    {
			      temp=sor[i];
			      sor[i]=sor[j];
			      sor[j]=temp;
			      tem=arr[i];
			      arr[i]=arr[j];
			      arr[j]=tem;
			    }

			  }

		       }
 }

/*====================================================================
void recta(float,float,float,float);
Description:Writes a lisp command for rectangular part.
Input:Bottomleft and topright co-ordinates of rectangle.
====================================================================*/
void recta(float x1,float y1,float x2,float y2)
{
 fprintf(f,"(command \"rectangle\" (list %f %f) (list %f %f))",x1-Lx,y1-Ly,x2-Lx,y2-Ly);
}

/*====================================================================
void recta1(int,int,int,int,int)
Description:Draws rectangles on screen.

Input:Co-ordinates of rectangles and rectangle position.
====================================================================*/
void recta1(int x1,int y1,int x2,int y2,int re_pos)
 {
  char str[10];
  int x11,y11,x21,y21,Lx1,Ly1;

  Lx1=getmaxx()/2-(scale/2);
  Ly1=getmaxy()/2-(scale/2);

  x11=Lx1+(x1-Lx)/x_scale;
  x21=Lx1+(x2-Lx)/x_scale;
  y11=Ly1+(y1-Ly)/y_scale;
  y21=Ly1+(y2-Ly)/y_scale;

  setcolor(YELLOW);
  rectangle(x11,ymax-y11,x21,ymax-y21);

  setcolor(YELLOW);
  settextstyle(0, HORIZ_DIR, 0);

  sprintf(str," %d",sor[re_pos].number+1);
  outtextxy(x11+5,ymax-(y11+8),str);

  if(sor[re_pos].rot==1)
   {
    settextstyle(0, HORIZ_DIR, 0);
    outtextxy(x11+2,ymax-y11-9,"R");
   }

 }

/*====================================================================

Description:

Input:

Returns:
====================================================================*/
void recta2(int x1,int y1,int re_pos)
 {
  char str[10];
  char lsp[200];
  int no,i,sides,te,i_count,Lx1,Ly1;

  Lx1=getmaxx()/2-(scale/2);
  Ly1=getmaxy()/2-(scale/2);
  setcolor(YELLOW);
  no=sor[re_pos].no;
  sides=pos[no].sides;

  if(sor[re_pos].rot==1)
   {
    for(i_count=0;i_count<sides;i_count++)
	  {
		te=pos[no].sy[i_count];
		pos[no].sy[i_count]=sor[re_pos].wid-pos[no].sx[i_count];
		pos[no].sx[i_count]=te;
	  }
   }

  for(i=0;i<sides-1;i++)
   line(Lx1+(x1+pos[no].sx[i]-Lx)/x_scale,ymax-(Ly1+(y1+pos[no].sy[i]-Ly)/y_scale),Lx1+(x1+pos[no].sx[i+1]-Lx)/x_scale,ymax-(Ly1+(y1+pos[no].sy[i+1]-Ly)/y_scale));

   line(Lx1+(x1+pos[no].sx[0]-Lx)/x_scale,ymax-(Ly1+(y1+pos[no].sy[0]-Ly)/y_scale),Lx1+(x1+pos[no].sx[sides-1]-Lx)/x_scale,ymax-(Ly1+(y1+pos[no].sy[sides-1]-Ly)/y_scale));

  setcolor(YELLOW);

  for(i=0;i<sides-1;i++)
   fprintf(f,"(command \"line\" (list %f %f) (list %f %f) \"\")",x1+pos[no].sx[i]-Lx,y1+pos[no].sy[i]-Ly,x1+pos[no].sx[i+1]-Lx,y1+pos[no].sy[i+1]-Ly);

   fprintf(f,"(command \"line\" (list %f %f) (list %f %f) \"\")",x1+pos[no].sx[0]-Lx,y1+pos[no].sy[0]-Ly,x1+pos[no].sx[sides-1]-Lx,y1+pos[no].sy[sides-1]-Ly);
}

/*====================================================================
float place_sort()
Description:Actual Placement of items.
Returns:Packing height
====================================================================*/
float place_sort()
 {
  int k=0,is,pflag,Lx1,Ly1;
  float ht=0.0,t;
  char str[30];
  char lsp[200];

  x_scale=(float)leng/scale;
  y_scale=(float)leng/scale;
  Lx1=getmaxx()/2-(scale/2);
  Ly1=getmaxy()/2-(scale/2);
  f=fopen(fname,"w");
  fprintf(f,"(defun c:go()");
  setfillstyle(SOLID_FILL,BLUE);
  bar(Lx1-3,25,Lx1,ymax-Ly1);
  bar(Lx1-3,ymax-Ly1+3,Lx1+scale+3,ymax-Ly1);
  bar(Lx1+scale,ymax-Ly1,Lx1+scale+3,25);

  for(is=0;((is<in)&&(sor[is].flag==0));is++)
	 {

	  if(sor[is].rot==1)
	    {
		t=sor[is].len;
		sor[is].len=sor[is].wid;
		sor[is].wid=t;
	    }

	  if(k==-1)
	    {
		is--;
		sprintf(str,"break at %d",is);
		outtextxy(15,15,str);
		break;
	    }

	  k=choosepivot(is);

	  p[k].isalive=1;

	  setcolor(RED);

	  if(sor[is].irr==0)
		{
		 recta1(chosen.sx,chosen.sy,chosen.sx+sor[is].len,chosen.sy+sor[is].wid,is);
		 recta(chosen.sx,chosen.sy,chosen.sx+sor[is].len,chosen.sy+sor[is].wid);
		}
	  if(sor[is].irr==1)
		{
		 recta2(chosen.sx,chosen.sy,is);
		}

	  p[k].pfor=is;

	  if(ht<(chosen.sy+sor[is].wid-Ly))
		 ht=chosen.sy+sor[is].wid-Ly;

	  if(p[k].which==0)
		{
		 if(sor[p[k].parent].wid>sor[is].wid)
		 pflag=0;
		 if(sor[p[k].parent].wid==sor[is].wid)
		 pflag=1;
		 if(sor[p[k].parent].wid<sor[is].wid)
		 pflag=2;
		}

	  if(p[k].which==1)
	   {
	       if((sor[p[k].parent].len>sor[is].len)||(sor[p[k].parent].len<sor[is].len))
		pflag=3;
	       if(sor[p[k].parent].len==sor[is].len)
		pflag=4;
	   }

	  if(p[k].which==2)
	  {
	    pflag=5;

	  }

	  pivot_status(pflag,k,is);

	  sor[is].flag=1;

	}

   sprintf(lsp,"(command \"rectangle\" (list %d %d) (list %d %d))",0,0,leng,leng);
   fputs(lsp,f);
   fprintf(f,"(command \"zoom\" \"e\" )");
   fputs(")",f);
   fclose(f);

   return ht;

 }

/*====================================================================
void load()
Description:Reads input data file for heuristic
Returns:Flag showing validty of input file.
====================================================================*/
int load()
{
  int i=0,choice,item_no=0,v_flag;
  char a[200];
  char str[200];
  char *valid="GENPACK2";
  char valid1[10];

  sprintf(str,"Enter name of input data file:");
  outtextxy(20,260,str);
  gotoxy(35,17);
  scanf("%s",&a);

  infp=fopen(a,"r");

  fscanf(infp,"%s",&valid1);
  v_flag=strcmp(valid,valid1);
  if(v_flag!=0)
   {
    fclose(infp);
    outtextxy(20,270,"Invalid Input File Format");
    printf("\a");
    getch();
   }
  else
  {
   fscanf(infp,"%d",&in);

   /*memory allocation*/
   rr=(struct rect*)malloc(in*sizeof(struct rect));
   sor=(struct rect*)malloc(in*sizeof(struct rect));
   arr=(int *)malloc(in*sizeof(int));
   ar1=(int *)malloc(in*sizeof(int));

   fscanf(infp,"%d",&leng);
   /*memory allocation for pivots*/
   p=(struct pivot*)malloc((2*in+1.5*leng)*(sizeof(struct pivot)));

   for(i=0;i<in;i++)
	{
	  fscanf(infp,"%d",&choice);

	  switch(choice)
		{
		 case 1:
			 getbound(item_no,i);
			 rr[i].no=item_no;
			 item_no++;
			 rr[i].flag=0;
			 rr[i].rot=0;
			 rr[i].irr=1;
			 rr[i].number=i;
			 break;

		 case 2:
			 fscanf(infp,"%f",&rr[i].len);
			 fscanf(infp,"%f",&rr[i].wid);
			 rr[i].flag=0;
			 rr[i].rot=0;
			 rr[i].irr=0;
			 rr[i].number=i;
			 break;
		 }

	}

   sprintf(str,"Enter name of lisp file:");
   outtextxy(20,292,str);
   gotoxy(35,19);
   scanf("%s",&fname);
   fclose(infp);
   }

  return v_flag;
 }

/*====================================================================
void sorting()
Description:Sorting solution output screen.
====================================================================*/
void sorting()
{
  char str[200];
  char ch;
  int i,flag_sort=0;
  float height1=0.0;

  Lx=(getmaxx()/2)-leng/2;
  Ly=(getmaxy()/2)-leng/2;

  do
   {
    cleardevice();
    flag_sort=0;
    ch=sort_menu();
    if(ch==27)
     break;
    cleardevice();

    switch(ch)
	{
	 case '1':
		     sortlen();
		     sprintf(str,"Solution by Length Sort");
		     break;

	 case '2':
		     sortwid();
		     sprintf(str,"Solution by Width Sort" );
		     break;

	 case '3':
		     sortarea();
		     sprintf(str,"Solution by Area Sort");
		     break;

	 case '4':
		     sortper();
		     sprintf(str,"Solution by Perimeter Sort");
		     break;

	 default:
		     sprintf(str,"Invalid Selection");
		     flag_sort=1;
		     break;

       }

   if(flag_sort==0)
     {
      setbkcolor(LIGHTBLUE);

      setcolor(WHITE);
      outtextxy(0,10,str);
      sprintf(str,"Press any key to return to sort menu");
      outtextxy(0,450,str);

      inplace();
      height1=place_sort();

      setcolor(YELLOW);
      sprintf(str," Packing height = %.2f",height1);
      outtextxy(400,20,str);
      setcolor(WHITE);

      getch();
      cleardevice();
     }
   }while(ch!=27);
 }

/*====================================================================
void input()
Description:Creates Data input file.
====================================================================*/
void input()
 {
  int leng,i,j,in,choice,no_sides;
  float len,wid;
  char b[200];

  clrscr();

  printf("Enter file name:");
  gets(b);
  fp=fopen(b,"w");

  fprintf(fp,"GENPACK2 ");
  printf("\nEnter number of items:");
  scanf("%d",&in);
  fprintf(fp,"%d ",in);

  printf("\nEnter length of base rectangle:");
  scanf("%d",&leng);
  fprintf(fp,"%d ",leng);

  for(i=0;i<in;i++)
	{
	  clrscr();
	  printf("\n 1.Irregular shaped item\n 2.Rectangle");
	  printf("\n \n Choose your option for item number %d: ",i+1);
	  scanf("%d",&choice);
	  switch(choice)
	  {
	   case 1:
		  fprintf(fp,"%d ",choice);
		  printf("\nEnter no. of sides of polyon (>2)\n");
		  scanf("%d",&no_sides);
		  fprintf(fp,"%d ",no_sides);
		  co_ord1=(struct co*)malloc(no_sides*(sizeof(struct co)));

		  for(j=0;j<no_sides;j++)
		   {
		    printf("\nEnter the co-cordinates of %d vertex of polygon:",j+1);
		    scanf("%f %f",&co_ord1[i].sx,&co_ord1[i].sy);
		    fprintf(fp,"%f %f ",co_ord1[i].sx,co_ord1[i].sy);
		   }
		  free(co_ord1);
		  break;

	   case 2:
		  fprintf(fp,"%d ",choice);
		  printf("\nEnter length and width of rectangle '%d' :",i+1);
		  scanf("%f %f",&len,&wid);
		  fprintf(fp,"%f %f ",len,wid);
		  break;

	   default:
		  printf("\n Invalid Selection");
		  getch();
		  i--;
		  break;
	}
      }

 fclose(fp);
}


/*====================================================================
char sort_menu()
Description:Shows option screen of heuristic solutions.
Returns:Selected item number.
====================================================================*/
char sort_menu()
 {
  char str[200];
  int i;

  setbkcolor(LIGHTBLUE);
  setcolor(BLUE);

  for(i=0;i<5;i++)
    rectangle(i,i,getmaxx()-i,getmaxy()-i);

  setcolor(LIGHTGRAY);

  for(i=0;i<5;i++)
    rectangle(i+5,i+5,(getmaxx()-(i+5)),(getmaxy()-(i+5)));

  setcolor(WHITE);
  outtextxy(310,40,"GENPACK");

  outtextxy(10,400,"Press esc to Exit");
  sprintf(str,"1 : Generate Solution by Length Sort.");
  outtextxy(20,70,str);
  sprintf(str,"2 : Generate Solution by Width Sort.");
  outtextxy(20,90,str);
  sprintf(str,"3 : Generate Solution by Area Sort.");
  outtextxy(20,110,str);
  sprintf(str,"4 : Generate Solution by Perimeter Sort.");
  outtextxy(20,130,str);
  outtextxy(20,160,"Choose your option:");
  return getch();
 }

/*====================================================================
void option_screen()
Description:Shows option screen.
====================================================================*/
void option_screen()
 {
  char str[200];
  int i;

  setcolor(BLINK);

  for(i=0;i<5;i++)
     rectangle(i,i,getmaxx()-i,getmaxy()-i);

  setcolor(LIGHTGRAY);

  for(i=0;i<5;i++)
    rectangle(i+5,i+5,(getmaxx()-(i+5)),(getmaxy()-(i+5)));

  setcolor(WHITE);
  outtextxy(310,40,"GENPACK");
  outtextxy(68,60,"OPTIMAL NESTING OF TWO DIMENSIONAL PARTS USING GENETIC ALGORITHMS");
  outtextxy(30,400,"Press esc to Exit");
  sprintf(str,"1 : Create Data file for input.");
  outtextxy(30,120,str);
  sprintf(str,"2 : Generate Solution by Heuristic Methods.");
  outtextxy(30,140,str);
  sprintf(str,"3 : Generate Solution by Genetic Approach.");
  outtextxy(30,160,str);
  outtextxy(30,180,"Choose your option:");
 }

/*====================================================================
void main()
Description:Main function.Calls other subroutines.
====================================================================*/
void main()
 {
  int gd=DETECT,gm,choice,i;
  char ch;
  char str[200];

  initgraph(&gd,&gm,"");
  ymax=getmaxy();
  xmax=getmaxx();
  ch='26';

  do
   {
    setbkcolor(LIGHTBLUE);
    option_screen();
    setcolor(WHITE);
    ch=getch();

    if(ch==27)
     exit(0);

    flushall();

    switch(ch) {

       case '1':
		closegraph();
		input();
		initgraph(&gd,&gm,"");
		break;

       case '2':
		outtextxy(220,180,"2");
		if(load()==0)
		 sorting();
		free(rr);
		free(sor);
		free(ar1);
		free(p);
		break;

	case '3':
		 outtextxy(220,180,"3");
		 tot_crossovers=0;
		 tot_mutations=0;
		 genetic();
		 free(rr);
		 free(sor);
		 free(ar1);
		 free(p);
		 break;

	default:
		 setcolor(RED);
		 sprintf(str,"Invalid Selection");
		 printf("\a");
		 outtextxy(40,440,str);
		 getch();

		}

     setcolor(LIGHTBLUE);
     sprintf(str,"Invalid Selection");
     outtextxy(40,400,str);

     cleardevice();

     flushall();

    }while(ch!=27);

 getch();

 closegraph();

}
