from manim import *
import numpy as np

class CircleToRectangleArea(Scene):
    def construct(self):
        # Constants for circle and rectangle dimensions
        radius = 2.0  # Radius of the circle
        num_sectors = 16  # Number of sectors to divide the circle into (must be even)
        sector_angle = TAU / num_sectors # Angle of each sector in radians

        # --- Scene 1: Introduction to Circle ---
        # Create a circle and a title text
        circle = Circle(radius=radius, color=BLUE, stroke_width=4, fill_opacity=0.2).move_to(ORIGIN)
        title_text = Text("Area of a Circle", font_size=50).to_edge(UP)

        # Animate the creation of the circle and the title
        self.play(Create(circle))
        self.play(Write(title_text))
        self.wait(1)

        # --- Scene 2: Dividing the Circle ---
        # Update the instruction text
        instruction_text = Text("Divide the circle into equal sectors.", font_size=40).to_edge(UP)

        # Create radial lines to represent the divisions of the circle
        radial_lines = VGroup() # Use VGroup to manage multiple lines
        for i in range(num_sectors):
            angle = i * sector_angle
            # Create a line from the center to the circle's edge
            line = Line(ORIGIN, circle.point_at_angle(angle), color=WHITE, stroke_width=2)
            radial_lines.add(line)

        # Animate the transformation of the title text and the growth of radial lines
        self.play(
            Transform(title_text, instruction_text), # Smoothly change the text
            GrowFromCenter(radial_lines), # Animate lines growing from the center
            run_time=2
        )
        self.wait(1)

        # --- Scene 3: Forming the Rectangle Approximation ---
        # Update the instruction text for rearrangement
        rearrange_text = Text("Rearrange the sectors...", font_size=40).to_edge(UP)

        # Fade out the previous instruction text
        self.play(
            FadeOut(title_text), # Fade out the instruction text (which is now title_text after transform)
            Write(rearrange_text) # Write new instruction text
        )
        # Uncreate the circle and its radial lines
        self.play(Uncreate(radial_lines), Uncreate(circle), run_time=1.5)
        self.wait(0.5)

        # Create individual small rectangle pieces that form the approximate rectangle
        sectors_in_rectangle = VGroup() # Group for all the small rectangular pieces
        
        # Calculate the width of each small segment that makes up the rectangle's width
        # The total width of the final rectangle is PI * radius
        # There are 'num_sectors' small segments along this width
        segment_width = (PI * radius) / num_sectors

        # Calculate the starting X position for the first segment
        # The entire rectangle approximation will be centered at the origin
        start_x_for_segments = - (PI * radius) / 2 

        # Loop to create and position each small rectangle slice
        for i in range(num_sectors):
            # Create a small rectangle representing one "sector slice"
            # Its height is the radius of the original circle
            sector_slice = Rectangle(width=segment_width, height=radius, color=ORANGE, stroke_width=1, fill_opacity=0.5)
            
            # Calculate the center x-position for the current slice
            current_x_center = start_x_for_segments + (i * segment_width) + (segment_width / 2)
            
            # Alternate the vertical position of the slices to form the jagged top/bottom of the approximated rectangle
            if i % 2 == 0: # Even index slices point 'up' (their base is at y=-radius/2 relative to the rectangle's center)
                sector_slice.move_to([current_x_center, -radius / 2, 0])
            else: # Odd index slices point 'down' (their base is at y=radius/2 relative to the rectangle's center)
                sector_slice.move_to([current_x_center, radius / 2, 0])
                sector_slice.flip(axis=UP) # Visually flip for the alternating pattern
            
            sectors_in_rectangle.add(sector_slice) # Add the slice to the VGroup

        # Animate the creation of these sector slices
        self.play(Create(sectors_in_rectangle), run_time=2)
        self.wait(1)

        # Define the target proper rectangle (smoothened approximation)
        final_rectangle = Rectangle(width=(PI * radius), height=radius, color=GREEN, stroke_width=4, fill_opacity=0.3)

        # Animate the transformation of the jagged sector slices into a smooth rectangle
        self.play(
            FadeOut(rearrange_text), # Fade out the "rearrange" text
            ReplacementTransform(sectors_in_rectangle, final_rectangle), # Transform the VGroup of slices into the final rectangle
            run_time=2
        )
        self.wait(1)

        # --- Scene 4: Labeling Dimensions ---
        # Create lines and arrows to indicate the width and height of the rectangle
        width_line = Line(final_rectangle.get_bottom_left(), final_rectangle.get_bottom_right()).shift(DOWN * 0.5)
        height_line = Line(final_rectangle.get_bottom_left(), final_rectangle.get_top_left()).shift(LEFT * 0.5)

        width_arrow = Arrow(width_line.get_start(), width_line.get_end(), buff=0.1)
        height_arrow = Arrow(height_line.get_start(), height_line.get_end(), buff=0.1)

        # Create labels for the width and height
        width_label = MathTex("\\pi r \\text{ (Half Circumference)}", font_size=35).next_to(width_line, DOWN, buff=0.1)
        height_label = MathTex("r \\text{ (Radius)}", font_size=35).next_to(height_line, LEFT, buff=0.1)

        # Animate the growth of arrows and writing of labels
        self.play(
            GrowArrow(width_arrow),
            Write(width_label),
            GrowArrow(height_arrow),
            Write(height_label)
        )
        self.wait(2)

        # --- Scene 5: Deriving the Area Formula ---
        # Create the initial formula for the area of a rectangle
        formula_rect_area_text = MathTex("Area_{Rectangle} = \\text{Width} \\times \\text{Height}", font_size=45).to_edge(UP)
        
        # Animate fading out old labels, shrinking/moving the rectangle, and writing the first formula
        self.play(
            FadeOut(width_arrow, height_arrow, width_label, height_label),
            # Create a copy of the rectangle, scale and move it, then transform the original into the copy
            Transform(final_rectangle, final_rectangle.copy().move_to(DOWN * 1.5).scale(0.8)), 
            Write(formula_rect_area_text)
        )
        self.wait(1)

        # Substitute the dimensions (pi*r and r) into the formula
        formula_subst_area_text = MathTex("Area_{Rectangle} = (\\pi r) \\times r", font_size=45).to_edge(UP)
        self.play(ReplacementTransform(formula_rect_area_text, formula_subst_area_text))
        self.wait(1)

        # Simplify to the area of a circle formula
        formula_circle_area_text = MathTex("Area_{Circle} = \\pi r^2", font_size=60).to_edge(UP)
        self.play(ReplacementTransform(formula_subst_area_text, formula_circle_area_text))
        self.wait(3)

        # Fade out final elements
        self.play(FadeOut(formula_circle_area_text, final_rectangle))
        self.wait(1)