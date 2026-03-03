#ifndef OPTIMIZED_STRUCTURES_H
#define OPTIMIZED_STRUCTURES_H

#include <stdio.h>
#include <stdlib.h>
#include <float.h>
#include <math.h>

#ifdef _OPENMP
#include <omp.h>
#endif

// Constants
#define MAX_HEIGHT 1000.0
#define MAX_POINTS 1000
#define QUADTREE_CAPACITY 4
#define MAX_POINTS_PER_NODE 8

// Structure for tracking pivot points
typedef struct {
    float x;
    float y;
    float avalx;
    float avaly;
    int isalive;
    int parent;
    int which;
    int ischeckx;
    int ischecky;
    int pfor;
} PivotPoint;

// Structure for quadtree node
typedef struct QuadTreeNode {
    float x;
    float y;
    float width;
    float height;
    int is_leaf;
    int num_points;
    PivotPoint** points;
    struct QuadTreeNode* children[4];
} QuadTreeNode;

// Structure for chromosome
typedef struct {
    int* order;
    int order_size;
    float fitness;
    int is_evaluated;
    int is_crossed;
} Chromosome;

// Structure for population
typedef struct {
    Chromosome* individuals;
    int size;
    float best_fitness;
    int best_index;
} Population;

// Function declarations
QuadTreeNode* create_quadtree(float x, float y, float width, float height);
void free_quadtree(QuadTreeNode* node);
void split_quadtree(QuadTreeNode* node);
void insert_point(QuadTreeNode* node, PivotPoint* point);
PivotPoint* find_best_pivot(QuadTreeNode* node, float width, float height);
void update_quadtree(QuadTreeNode* node, PivotPoint* point);

void initialize_population(void);
void evaluate_population_parallel(void);
void tournament_selection(void);
void crossover_optimized(Chromosome* parent1, Chromosome* parent2);
void mutate_optimized(Chromosome* chromosome);
void update_quadtree_for_generation(void);
void free_resources(void);

#endif // OPTIMIZED_STRUCTURES_H 