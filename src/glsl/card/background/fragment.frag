#pragma glslify: curlNoise = require(../../../utils/glsl/curlNoise.glsl)
#pragma glslify: cnoise = require(glsl-noise/classic/3d)
#pragma glslify: cnoise2 = require(glsl-noise/classic/2d)
#pragma glslify: snoise = require(glsl-noise/simplex/2d)


precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uAlpha;
uniform float uRadius;
uniform float uBackgroundOffset;
uniform vec2 uSize;
uniform vec3 uBackgroundColor;
uniform vec3 uStrokeColor;
uniform vec3 uColor;
uniform vec3 uColor1;
// uniform vec4 uResolution;
uniform vec3 uResolution;

uniform sampler2D uWhiteGlowMC;
uniform sampler2D uCardBackTexture;
uniform sampler2D uMarbreTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

float roundRect(vec2 p, vec2 b, float r) {
	return step(.001, length(max(abs(p) - b + r, 0.)) - r);
}

float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float linearstep(float begin, float end, float t) {
	return clamp((t - begin) / (end - begin), 0.0, 1.0);
}

float setStroke(vec2 halfSize, vec2 coord, vec2 size, float strokeWidth, float offset) {

	vec2 pos = vec2(0.);
	pos = offset - (coord - halfSize) * (vec2(1.099, 1.055) * size);
	float stroke = roundRect(pos, halfSize, uRadius);
	pos = offset - (coord - halfSize) * (vec2(1.09, 1.05) * size);
	stroke -= roundRect(pos, halfSize, uRadius);

	// vec2 innerBottomLeftStroke = step(vec2(size, size / 2.) * (uResolution.xy / uSize), vUv - offset);
    // float innerStroke = innerBottomLeftStroke.x * innerBottomLeftStroke.y;

    // vec2 innerTopRightStroke = step(vec2(size, size / 2.) * (uResolution.xy / uSize), 1. - vUv + offset);
    // innerStroke *= (innerTopRightStroke.x * innerTopRightStroke.y);

	// float outerStrokeWidth = size - strokeWidth;
    // vec2 outerBottomLeftStroke = step(vec2(outerStrokeWidth, outerStrokeWidth / 2.) * (uResolution.xy / uSize), vUv - offset);
    // float outerStroke = outerBottomLeftStroke.x * outerBottomLeftStroke.y;

    // vec2 outerTopRightStroke = step(vec2(outerStrokeWidth, outerStrokeWidth / 2.) * (uResolution.xy / uSize), 1. - vUv + offset);
    // outerStroke *= (outerTopRightStroke.x * outerTopRightStroke.y);

	// float stroke = outerStroke - innerStroke;

	return stroke;
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec3 color = vec3(uBackgroundColor);
	float alpha = uAlpha;

	vec2 mUv = vec2(viewMatrix * vec4(normalize(vNormal), 0)) * 0.5 + vec2(0.5, 0.5);
	vec4 whiteGlowMC = texture2D(uWhiteGlowMC, vec2(mUv.x, 1.0 - mUv.y));

	// round corners
	vec2 halfSize = uSize * .5;
	vec2 coord = vUv * uSize;
	vec2 pos = coord - halfSize;
	float roundCorner = roundRect(pos, halfSize, uRadius);
	alpha -= roundCorner;

	// strokes
	float strokes = 0.;
	vec2 size = vec2(1.05, 1.025);
	// const float size = .07;
	const float width = .006;

	float stroke1 = setStroke(halfSize, coord, size, width, 4.);
	float stroke2 = setStroke(halfSize, coord, size, width, -4.);
	// float stroke1 = setStroke(size, width, vec2(.01, .005));
	// float stroke2 = setStroke(size, width, vec2(-.01, -.005));

	strokes = (stroke1 + stroke2) - (stroke1 * stroke2);

	vec3 finalStrokes = mix(vec3(0.), uStrokeColor, vec3(strokes));
	finalStrokes *= .75 + cnoise2(uBackgroundOffset + (vUv * 1.5) + (uTime * .0004));
	finalStrokes *= uStrokeColor * (1. + whiteGlowMC.xyz);


	vec3 frontSide = color;

	vec3 marbre = texture2D(uMarbreTexture, vUv).xyz;

	frontSide += .1 * (smoothstep(.5, 1., marbre) + (whiteGlowMC.xyz)) + finalStrokes;

	// cover
	vec2 uv = vUv * .6;
	vec2 curlUv = vec2(snoise(uBackgroundOffset + uv + (uTime * .0001)) * (uv * 1.5));


	vec3 backSide = texture2D(uCardBackTexture, vUv).xyz;
	vec3 cursedBackSide = texture2D(uCardBackTexture, curlUv).xyz;

	vec3 motif = smoothstep(.2, .5, backSide);

	backSide = mix(backSide, cursedBackSide, motif);
	backSide += strokes - (backSide * strokes);
	backSide *= 1.5 * (mix(cursedBackSide, 1.5 + 3. * whiteGlowMC.xyz, motif));


	if (gl_FrontFacing) {
		gl_FragColor = vec4(frontSide, alpha);
	} else {
		gl_FragColor = vec4(backSide, alpha);
		// gl_FragColor = vec4(.25 + smoothstep(.25, .75, whiteGlowMC.xyz), alpha);
	}

	// gl_FragColor = vec4(vec3(contours), alpha);
}
