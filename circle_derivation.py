from manim import *

class CircleEquationDerivation(Scene):
    def construct(self):
        # 2. Scene Setup
        # Display a coordinate plane with labeled x and y axes.
        # Set the origin at the center or somewhere convenient.
        plane = NumberPlane(
            x_range=[-6, 6, 1],
            y_range=[-4, 4, 1],
            x_length=12,
            y_length=8,
            axis_config={"font_size": 24, "color": LIGHT_GRAY},
            background_line_style={
                "stroke_color": GREY_B,
                "stroke_width": 1,
                "stroke_opacity": 0.6
            }
        ).add_coordinates()
        
        # 1. Show the coordinate axes
        self.play(Create(plane))
        self.wait(0.5)

        # 3. Key Visual Elements
        # Mark the center of the circle as a distinct point (h, k), label it.
        # Let's choose a specific center for visualization, e.g., (2, 1)
        center_coords = np.array([2, 1, 0])
        center_dot = Dot(point=plane.coords_to_point(center_coords[0], center_coords[1]), color=BLUE)
        center_label = MathTex("(h, k)", font_size=36).next_to(center_dot, UR, buff=0.1)
        
        # 1. Show the fixed center point (h, k)
        self.play(Create(center_dot), Write(center_label))
        self.wait(1)

        # Draw a variable point P(x, y) somewhere on the plane
        # Let's define a radius for the final circle first, say r=3
        radius_val = 3
        initial_P_coords = center_coords + np.array([radius_val, 0, 0]) # P starts at (h+r, k)

        point_P_dot = Dot(point=plane.coords_to_point(initial_P_coords[0], initial_P_coords[1]), color=RED)
        point_P_label = MathTex("P(x, y)", font_size=36).next_to(point_P_dot, UR, buff=0.1)

        # 2. Introduce a movable point P(x, y)
        self.play(Create(point_P_dot), Write(point_P_label))
        self.wait(1)

        # Draw a line segment from center C to P
        line_CP = always_redraw(
            lambda: Line(center_dot.get_center(), point_P_dot.get_center(), color=YELLOW)
        )
        
        # Show the radius r as the length of the segment from center to P.
        radius_label = always_redraw(
            lambda: MathTex("r", font_size=36).next_to(line_CP.get_center(), RIGHT, buff=0.1)
        )

        # 3. Draw the segment CP and label it as radius r
        self.play(Create(line_CP), Write(radius_label))
        self.wait(1)

        # Show the horizontal and vertical distances from C to P, i.e., |x-h| and |y-k|,
        # with dashed lines or arrows to form a right triangle.
        
        # The intermediate point for the right triangle (the corner).
        # This is a coordinate, not a Manim Mobject, so it should not be wrapped in always_redraw.
        # Its calculation will be part of the lambda functions for the lines and angle.
        
        horizontal_line = always_redraw(
            lambda: DashedLine(
                center_dot.get_center(),
                # Calculate the intermediate point here directly
                plane.coords_to_point(
                    plane.point_to_coords(point_P_dot.get_center())[0], # x-coordinate from P
                    plane.point_to_coords(center_dot.get_center())[1]   # y-coordinate from C
                ),
                color=GREEN
            )
        )
        vertical_line = always_redraw(
            lambda: DashedLine(
                # Calculate the intermediate point here directly
                plane.coords_to_point(
                    plane.point_to_coords(point_P_dot.get_center())[0], # x-coordinate from P
                    plane.point_to_coords(center_dot.get_center())[1]   # y-coordinate from C
                ),
                point_P_dot.get_center(),
                color=ORANGE
            )
        )

        # Labels for the legs of the triangle
        x_diff_label = always_redraw(
            lambda: MathTex("|x-h|", font_size=30)
            .next_to(horizontal_line.get_center(), DOWN, buff=0.1)
            .set_color(GREEN)
        )
        y_diff_label = always_redraw(
            lambda: MathTex("|y-k|", font_size=30)
            .next_to(vertical_line.get_center(), RIGHT, buff=0.1)
            .set_color(ORANGE)
        )

        # Right angle marker
        right_angle_marker = always_redraw(
            lambda: RightAngle(horizontal_line, vertical_line, length=0.3, quadrant=(1,1))
        )
        
        # 4. Show the horizontal and vertical distances
        self.play(
            Create(horizontal_line),
            Create(vertical_line),
            run_time=1
        )
        self.play(
            Create(right_angle_marker),
            Write(x_diff_label),
            Write(y_diff_label),
            run_time=1
        )
        self.wait(1.5)

        # 5. Display the Pythagorean theorem relation
        pythagorean_intro = Text("By Pythagorean Theorem:", font_size=36).to_edge(UP)
        pythagorean_formula = MathTex(
            "a^2 + b^2 = c^2", font_size=48
        ).next_to(pythagorean_intro, DOWN, buff=0.5)

        self.play(Write(pythagorean_intro))
        self.play(Write(pythagorean_formula))
        self.wait(1)

        # Substitute the lengths
        substituted_formula = MathTex(
            "(x-h)^2 + (y-k)^2 = r^2", font_size=48
        ).move_to(pythagorean_formula.get_center())

        self.play(
            ReplacementTransform(pythagorean_formula, substituted_formula),
            FadeOut(pythagorean_intro)
        )
        self.wait(2)

        # 6. Highlight that this equation defines all points P at distance r from C, thus the circle.
        circle_explanation_text = Text(
            "This equation defines all points P(x, y)",
            font_size=30
        ).to_edge(UP, buff=0.5).shift(LEFT*0.5) # Initial positioning
        
        circle_explanation_text_line2 = Text(
            "that are at a fixed distance 'r' from the center (h, k).",
            font_size=30
        ).next_to(circle_explanation_text, DOWN, buff=0.2, aligned_edge=LEFT)

        self.play(
            FadeOut(x_diff_label, y_diff_label, right_angle_marker),
            FadeOut(horizontal_line, vertical_line), # Fade out components as we generalize
            Write(circle_explanation_text)
        )
        self.play(Write(circle_explanation_text_line2))
        self.wait(2)

        # Optionally, animate P moving around, keeping the distance fixed to show the locus of points forming the circle.
        # Create the actual circle object
        circle_mobject = Circle(
            radius=radius_val,
            color=YELLOW,
            stroke_width=4
        ).move_to(center_dot.get_center()) # Ensure circle is centered at (h,k)
        
        # Animating P along the circle
        # Remove the previous P label and tracker as P will now follow the circle path
        self.remove(point_P_label) # point_P_label was not added with always_redraw, so it won't auto-update.
                                 # We remove it to avoid confusion during the circle animation.
        
        self.play(
            FadeOut(circle_explanation_text, circle_explanation_text_line2),
            FadeIn(circle_mobject, shift=UP), # Fade in the circle as the path
            run_time=1.5
        )
        self.play(
            MoveAlongPath(point_P_dot, circle_mobject),
            run_time=4,
            rate_func=linear # Keep P moving smoothly
        )
        self.wait(1)

        # Final Scene Description
        # Emphasize the equation and its relation to the circle
        final_equation = MathTex(
            "(x-h)^2 + (y-k)^2 = r^2", font_size=60, color=YELLOW
        ).to_edge(UP)

        self.play(
            Transform(substituted_formula, final_equation),
            point_P_dot.animate.set_color(BLUE), # Change P's color to match center
            FadeOut(line_CP, radius_label) # Fade out the individual radius line as the circle is now visible
        )
        self.play(point_P_dot.animate.scale(0.01), FadeOut(point_P_dot)) # P fades out after defining the circle
        self.wait(2)

        # Add a final text reinforcing the concept
        conclusion_text = Text(
            "This is the standard equation of a circle.",
            font_size=36,
            color=WHITE
        ).next_to(final_equation, DOWN, buff=1)

        self.play(Write(conclusion_text))
        self.wait(3)

        # Clean up
        self.play(
            FadeOut(plane, center_dot, center_label, circle_mobject, final_equation, conclusion_text)
        )
        self.wait(1)