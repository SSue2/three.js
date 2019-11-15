/**
 *  @author scrubs / https://www.mecabricks.com
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { NormalNode } from '../accessors/NormalNode.js';
import { PositionNode } from '../accessors/PositionNode.js';

class TriplanarNormalMapNode extends TempNode {
    constructor(texture, scale, strength, rotation) {
        super('v3');

        this.texture = texture;
        this.scale = scale;
        this.strength = strength;
        this.rotation = rotation;
    }

    generate(builder, output) {
        let blend = [
			'   vec3 blend = vec3(0.0);',
            '   vec3 absNormal = abs(normalize(localNormal));',
            '   blend.x = dot(absNormal, vec3(1.0, 0.0, 0.0));',
            '   blend.y = dot(absNormal, vec3(0.0, 1.0, 0.0));',
			'   blend.z = dot(absNormal, vec3(0.0, 0.0, 1.0));',
        ];

        let uvs = [
            '   vec2 uvx = localPosition.yz * textureScale;',
            '   vec2 uvy = localPosition.zx * textureScale;',
            '   vec2 uvz = localPosition.xy * textureScale;'
        ];

        let perturbNormal2Arb = [
            '	vec3 q0 = vec3(dFdx(eyePosition.x), dFdx(eyePosition.y), dFdx(eyePosition.z));',
            '	vec3 q1 = vec3(dFdy(eyePosition.x), dFdy(eyePosition.y), dFdy(eyePosition.z));'
        ];

        let normals = [
            '   vec2 st0, st1;',
            '   float scale;',
            '   vec3 S, T, N;',
			'   mat3 tsn;',
        ];

        ['x', 'y', 'z'].forEach(axis => {
            let normal = [
                '	st0 = dFdx(uv' + axis + '.st);',
                '	st1 = dFdy(uv' + axis + '.st);',

                '	scale = sign(st1.t * st0.s - st0.t * st1.s);',

                '	S = normalize((q0 * st1.t - q1 * st0.t) * scale);',
                '	T = normalize((- q0 * st1.s + q1 * st0.s) * scale);',
                '	N = normalize(eyeNormal);',
                '	tsn = mat3(S, T, N);',
				`   mat3 rot${axis} = mat3(cos(rotation.${axis}),-sin(rotation.${axis}), 0.,`,
				`                          sin(rotation.${axis}), cos(rotation.${axis}), 0.,`,
				`                          0.                   ,                    0., 1.);`,
				'	vec3 map' + axis + ' = texture2D(texture, mat2(rot' + axis + ') * uv' + axis + ').xyz * 2.0 - 1.0;',

                '	map' + axis + '.xy *= normalScale;',
                '	map' + axis + '.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);',
                '	vec3 normal' + axis + ' = normalize(tsn * (rot' + axis + ' * map' + axis + ' * blend.' + axis + '));',
			];

            normals = normals.concat(normal);
        });

        perturbNormal2Arb = perturbNormal2Arb.concat(normals);

        let nodeFunction = blend.concat(uvs, perturbNormal2Arb);
        nodeFunction.unshift('vec3 normal_mapping(sampler2D texture, float textureScale, vec3 eyeNormal, vec3 localNormal, vec3 eyePosition, vec3 localPosition, vec2 normalScale, vec3 rotation) {');
        nodeFunction = nodeFunction.concat([
            '   vec3 result = normalize(normalx + normaly + normalz);',
            '    return result;',
            '}'
        ]);

        let normalMapping = new FunctionNode(nodeFunction.join('\n'), null, {derivatives: true});

        let inputs = [
            this.texture.build(builder, 'sampler2D'),
            this.scale.build(builder, 'f'),
            new NormalNode(NormalNode.VIEW).build(builder, 'v3'),
            new NormalNode(NormalNode.LOCAL).build(builder, 'v3'),
            new PositionNode(PositionNode.VIEW).build(builder, 'v3'),
            new PositionNode(PositionNode.LOCAL).build(builder, 'v3'),
            this.strength.build(builder, 'v2'),
            this.rotation.build(builder, 'v3')
        ];

        return builder.format(builder.include(normalMapping) + '(' + inputs.join(', ') + ')',
            this.getType(builder), output
        );
    }
}

export { TriplanarNormalMapNode };
