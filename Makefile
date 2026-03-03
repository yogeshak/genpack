CC = gcc
CFLAGS = -O3 -I/usr/local/include -I/usr/include -Wall
LDFLAGS =

SRCS = Source/Reg-tourna.c Source/quadtree_ops.c Source/globals.c Source/graphics.c
OBJS = $(SRCS:.c=.o)
TARGET = genpack

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET) $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean 