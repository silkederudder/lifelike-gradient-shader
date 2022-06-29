precision mediump float;

// Global
uniform vec2 u_resolution;
uniform float u_time;
// Colors
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
// Rotation
uniform float u_rotation_start;
uniform float u_rotation_amplitude;
uniform float u_rotation_speed;
// Left
uniform float u_color_left_pct;
uniform float u_color_left_offset;
uniform float u_color_left_roundness;
uniform float u_color_left_roundness_offset;
// Right
uniform float u_color_right_pct;
uniform float u_color_right_offset;
uniform float u_color_right_roundness;
uniform float u_color_right_roundness_offset;
// Grain
uniform float u_grain_amount_r;
uniform float u_grain_amount_g;
uniform float u_grain_amount_b;
// Other
uniform float u_middle;

float map(float value, float min1, float max1, float min2, float max2)
{
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float random(vec2 p)
{
    vec2 K1 = vec2(
    23.14069263277926, // e^pi (Gelfond's constant)
    2.665144142690225 // 2^sqrt(2) (Gelfond–Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main()
{
    // Constants
    float PI = 3.14;

    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;

    // Offset origin to middle
    vec2 origin = vec2(0.5, 0.5);
    uv -= origin;

    // Initialize color
    vec3 color = vec3(0.0, 0.0, 0.0);

    // Add static colored noise
    vec2 uvRandom = uv;
    uvRandom.x *= random(vec2(uvRandom.y, 0.5));
    uvRandom.y *= random(vec2(uvRandom.x, 0.5));
    color.r -= random(uvRandom) * u_grain_amount_r;
    color.g -= random(uvRandom * 1.6) * u_grain_amount_g;
    color.b -= random(uvRandom * 0.7) * u_grain_amount_b;

    // Animate rotation around center
    float currentAngle = sin(u_time * u_rotation_speed) * u_rotation_amplitude;
    float angle = radians(u_rotation_start) - radians(currentAngle) + atan(uv.y, uv.x);

    float len = length(uv);
    uv = vec2(cos(angle) * len, sin(angle) * len) + origin;

    // Animate middle color left and right
    float middle = map(sin(u_time), -1.0, 1.0, u_middle - 0.15, u_middle + 0.15);

    // Create a curved transition into the middle color along the y axis
    float leftTransition = (sin(uv.y * PI + u_color_left_roundness_offset) * u_color_left_roundness + 1.0);
    // Inverted
    float rightTransition = ((1.0 - sin(uv.y * PI + u_color_right_roundness_offset)) * u_color_right_roundness + 1.0);

    // Easing between left and middle color
    float leftEasingCurve = smoothstep(0.0, u_color_left_offset, uv.x * leftTransition / middle);
    // Inverted for middle and right color
    float rightEasingCurve = smoothstep(1.0 - u_color_right_offset, 1.0, ((uv.x * rightTransition) - middle) / (1.0 - middle));

    // Create left and right gradients
    vec3 left = mix(u_color1, u_color2, leftEasingCurve);
    vec3 right = mix(u_color2, u_color3, rightEasingCurve);

    // Compose global gradient
    float easeOutSine = sin((uv.x * PI) * 0.5);
    float easeInSine = 1.0 - cos((uv.x * PI) * 0.5);
    // Animate between easing functions
    color += mix(left, right, mix(easeOutSine, easeInSine, sin(u_time * 0.3) * 0.5 + 0.5));

    gl_FragColor = vec4(color , 1.0);
}