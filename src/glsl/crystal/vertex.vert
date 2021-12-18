/* example */
// #pragma glslify: functionName = require(../../utils/glsl/templateFunction.glsl)
#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)

precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform sampler2D uDisplacementMap;

varying vec3 vNormal;
varying vec3 vDotNormal;
varying vec2 vUv;
varying vec3 vPos;

// void main() {
// 	vec3 displacementTexture = texture2D(uDisplacementMap, uv).xyz;

// 	vec3 pos = position;
// 	vec3 distort = position * displacementTexture;
// 	float noise = snoise4(vec4(position, uTime * .0002));
// 	// pos += mix(position, distort, noise * .5);
// 	// pos += (distort * .25);

// 	vec4 mv = modelViewMatrix * vec4(pos, 1.);
// 	// float modelNormal = dot(mv.xyz, cameraPosition);
// 	vec3 modelNormal = cameraPosition - mv.xyz;
// 	gl_Position = projectionMatrix * mv;

// 	vDotNormal = modelNormal;
// 	vNormal = normal;
// 	vUv = uv;
// 	vPos = pos;
// }


varying vec3 vPositionW;
varying vec3 vNormalW;

void main() {
	vec4 mv = modelViewMatrix * vec4( position, 1. );
	gl_Position = projectionMatrix * mv;

	vPositionW = vec3( vec4( position, 1. ) * modelMatrix);
	vNormalW = normalize( vec3( vec4( normal, .0 ) * modelMatrix ) );

	vNormal = normalize( vec3( vec4( normal, .0 ) * modelMatrix ) );

	vUv = uv;
	vPos = position;
}

