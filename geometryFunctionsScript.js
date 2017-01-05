function lineIntersection(m1, q1, m2, q2){   
    if(m1 != m2){
        var yIntersection = (m1*q2-m2*q1)/(m1-m2);
        var xIntersection = (yIntersection - q1)/m1;
        return [xIntersection, yIntersection];
    }
    else{
        return [-1, -1];
    }
}

function findLineParameters(p1_x, p1_y, p2_x, p2_y){
    if((p2_x - p1_x) != 0){
        var m = (p2_y - p1_y) / (p2_x - p1_x);
    }
    else m = 0;  
    var q = p1_y - m*p1_x;

    return [m, q]
}

function distanceBetweenPoints(p1, p2){
    return Math.sqrt(Math.pow(p1[0]-p2[0],2) + Math.pow(p1[1]-p2[1],2));
}