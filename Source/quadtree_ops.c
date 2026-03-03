#include "optimized_structures.h"
#include <stdlib.h>
#include <float.h>

QuadTreeNode* create_quadtree(float x, float y, float width, float height) {
    QuadTreeNode* node = (QuadTreeNode*)malloc(sizeof(QuadTreeNode));
    node->x = x;
    node->y = y;
    node->width = width;
    node->height = height;
    node->is_leaf = 1;
    node->num_points = 0;
    node->points = NULL;
    node->children[0] = node->children[1] = node->children[2] = node->children[3] = NULL;
    return node;
}

void free_quadtree(QuadTreeNode* node) {
    if(!node) return;
    
    if(!node->is_leaf) {
        for(int i = 0; i < 4; i++) {
            free_quadtree(node->children[i]);
        }
    }
    
    if(node->points) {
        free(node->points);
    }
    
    free(node);
}

void split_quadtree(QuadTreeNode* node) {
    if(!node->is_leaf) return;
    
    float half_width = node->width / 2;
    float half_height = node->height / 2;
    
    node->children[0] = create_quadtree(node->x, node->y, half_width, half_height);
    node->children[1] = create_quadtree(node->x + half_width, node->y, half_width, half_height);
    node->children[2] = create_quadtree(node->x, node->y + half_height, half_width, half_height);
    node->children[3] = create_quadtree(node->x + half_width, node->y + half_height, half_width, half_height);
    
    node->is_leaf = 0;
    
    // Redistribute points to children
    for(int i = 0; i < node->num_points; i++) {
        PivotPoint* point = node->points[i];
        for(int j = 0; j < 4; j++) {
            if(point->x >= node->children[j]->x && 
               point->x < node->children[j]->x + node->children[j]->width &&
               point->y >= node->children[j]->y && 
               point->y < node->children[j]->y + node->children[j]->height) {
                insert_point(node->children[j], point);
                break;
            }
        }
    }
    
    free(node->points);
    node->points = NULL;
    node->num_points = 0;
}

void insert_point(QuadTreeNode* node, PivotPoint* point) {
    if(!node->is_leaf) {
        for(int i = 0; i < 4; i++) {
            if(point->x >= node->children[i]->x && 
               point->x < node->children[i]->x + node->children[i]->width &&
               point->y >= node->children[i]->y && 
               point->y < node->children[i]->y + node->children[i]->height) {
                insert_point(node->children[i], point);
                return;
            }
        }
        return;
    }
    
    node->points = (PivotPoint**)realloc(node->points, (node->num_points + 1) * sizeof(PivotPoint*));
    node->points[node->num_points++] = point;
    
    if(node->num_points > MAX_POINTS_PER_NODE) {
        split_quadtree(node);
    }
}

PivotPoint* find_best_pivot(QuadTreeNode* node, float width, float height) {
    if(!node) return NULL;
    
    if(node->is_leaf) {
        PivotPoint* best_point = NULL;
        float best_y = FLT_MAX;
        
        for(int i = 0; i < node->num_points; i++) {
            PivotPoint* point = node->points[i];
            if(!point->isalive && 
               point->avalx >= width && 
               point->avaly >= height) {
                if(point->y < best_y) {
                    best_y = point->y;
                    best_point = point;
                }
            }
        }
        
        return best_point;
    }
    
    PivotPoint* best_point = NULL;
    float best_y = FLT_MAX;
    
    for(int i = 0; i < 4; i++) {
        PivotPoint* point = find_best_pivot(node->children[i], width, height);
        if(point && point->y < best_y) {
            best_y = point->y;
            best_point = point;
        }
    }
    
    return best_point;
}

void update_quadtree(QuadTreeNode* node, PivotPoint* point) {
    if(!node) return;
    
    if(node->is_leaf) {
        for(int i = 0; i < node->num_points; i++) {
            if(node->points[i] == point) {
                // Update point properties
                point->isalive = 1;
                return;
            }
        }
    } else {
        for(int i = 0; i < 4; i++) {
            if(point->x >= node->children[i]->x && 
               point->x < node->children[i]->x + node->children[i]->width &&
               point->y >= node->children[i]->y && 
               point->y < node->children[i]->y + node->children[i]->height) {
                update_quadtree(node->children[i], point);
                return;
            }
        }
    }
} 