class StereoCamera {
    constructor(eyeSeparation, convergence, aspectRatio, FOV, nearClippingDistance, farClippingDistance) {
        this.eyeSeparation = eyeSeparation;
        this.convergence = convergence;
        this.aspectRatio = aspectRatio;
        this.FOV = FOV;
        this.nearClippingDistance = nearClippingDistance;
        this.farClippingDistance = farClippingDistance;
    }

    calcLeftFrustum() {
        const top = this.nearClippingDistance * Math.tan(this.FOV / 2);
        const bottom = -top;

        const halfWidth = this.aspectRatio * Math.tan(this.FOV / 2) * this.convergence;
        const leftOffset = halfWidth - this.eyeSeparation / 2;
        const rightOffset = halfWidth + this.eyeSeparation / 2;

        const left = -leftOffset * this.nearClippingDistance / this.convergence;
        const right = rightOffset * this.nearClippingDistance / this.convergence;

        return m4.frustum(left, right, bottom, top, this.nearClippingDistance, this.farClippingDistance);
    }

    calcRightFrustum() {
        const top = this.nearClippingDistance * Math.tan(this.FOV / 2);
        const bottom = -top;

        const halfWidth = this.aspectRatio * Math.tan(this.FOV / 2) * this.convergence;
        const leftOffset = halfWidth - this.eyeSeparation / 2;
        const rightOffset = halfWidth + this.eyeSeparation / 2;

        const left = -rightOffset * this.nearClippingDistance / this.convergence;
        const right = leftOffset * this.nearClippingDistance / this.convergence;

        return m4.frustum(left, right, bottom, top, this.nearClippingDistance, this.farClippingDistance);
    }
}
