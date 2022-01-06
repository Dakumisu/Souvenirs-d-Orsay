#pragma glslify: cnoise2 = require(glsl-noise/classic/2d)

precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uBackgroundOffset;
uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
uniform vec3 uStrokeColor;
uniform float uRadius;
uniform vec2 uSize;
// uniform vec4 uResolution;
uniform vec3 uResolution;
uniform sampler2D uWhiteGlowMC;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

float roundRect(vec2 p, vec2 b, float r) {
  return step(.001, length(max(abs(p) - b + r, 0.)) - r);
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec2 uv = gl_FragCoord.xy / uResolution.xy;
	uv /= uResolution.z;

	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	vec2 mUv = vec2(viewMatrix * vec4(normalize(vNormal), 0)) * 0.5 + vec2(0.5, 0.5);
	vec4 whiteGlowMC = texture2D(uWhiteGlowMC, vec2(mUv.x, 1.0 - mUv.y));

	// set round corners
	vec2 halfSize = uSize * .5;
	vec2 coord = vUv * uSize;

	vec2 pos = (coord - halfSize);
	float roundCorner = roundRect(pos, halfSize, uRadius);
	alpha -= roundCorner;

	//Bottom left
    vec2 bl = step(vec2(0.05), vUv);
    float pct = bl.x * bl.y;

    //Top right
    vec2 tr = step(vec2(0.05), 1.-vUv);
    pct *= (tr.x * tr.y);

	pos = (coord - halfSize) * 1.1;
	pct -= roundRect(pos, halfSize, uRadius) + (pct * roundRect(pos, halfSize, uRadius));

	vec3 stroke = vec3(pct);

	stroke *= .75 + cnoise2(uBackgroundOffset + vUv + (uTime * .00035));
	stroke *= uStrokeColor + whiteGlowMC.xyz;

	// vec3 test = pct * (1. + whiteGlowMC.xyz);

    color = mix(uColor, uStrokeColor, 1. - pct);
    color = mix(color, stroke, pct);

	gl_FragColor = vec4(color, alpha);
}
